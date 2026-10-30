import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import type { Activity } from "../src/types";
import { normalize, parseCSV } from "../scripts/data.mjs";
import {
  GitHubClient,
  ConflictError,
  GitHubError,
  fromBase64,
  toBase64,
  serializeCSV,
  validateDraft,
  repository,
} from "../src/admin/github";
const token = "github_pat_TEST_ONLY_NOT_A_REAL_TOKEN";
const original = normalize(
  parseCSV(fs.readFileSync("input/esperienze_2027.originale.csv", "utf8")),
) as Activity[];
const sha = "a".repeat(40),
  nextSha = "b".repeat(40),
  commit = "c".repeat(40);
const json = (value: unknown, status = 200, headers?: Record<string, string>) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
const file = (activities = original) => ({
  type: "file",
  encoding: "base64",
  content: toBase64(serializeCSV(activities)),
  sha,
});
const mock = (
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
) =>
  vi.fn((url: RequestInfo | URL, init: RequestInit = {}) =>
    Promise.resolve(handler(String(url), init)),
  ) as unknown as typeof fetch;

describe("Contratto e protezione del pannello", () => {
  it("CSV Unicode con note multilinea, virgole e virgolette ritorna identico ai dati validati", () => {
    const rows = original.map((a) => ({ ...a }));
    rows[0].note_diario = 'È stato bellissimo, "davvero".\nDa rifare!';
    rows[0].voto_ale = 8.5;
    rows[0].prezzo_persona_eur = null;
    expect(normalize(parseCSV(serializeCSV(rows)))).toEqual(rows);
    expect(fromBase64(toBase64("È un tè, sì. 日本語"))).toBe(
      "È un tè, sì. 日本語",
    );
  });
  it("blocca voti, esiti, URL e numeri settimana invalidi prima della rete", async () => {
    const transport = mock(() => {
      throw Error("non deve chiamare la rete");
    });
    const client = new GitHubClient(token, transport);
    for (const patch of [
      { voto_ale: 11 },
      { esito: "Finito" },
      { fonte_url: "javascript:alert(1)" },
      { settimana: 3 },
      { id: "W02" },
      { prezzo_persona_eur: -2 },
    ]) {
      await expect(
        client.save(original[0], { ...original[0], ...patch } as Activity),
      ).rejects.toThrow();
    }
    expect(transport).not.toHaveBeenCalled();
  });
  it("non pubblica accidentalmente una credenziale incollata nel diario", () => {
    expect(() =>
      validateDraft(original[0], { ...original[0], note_diario: token }),
    ).toThrow(/credenziale/);
  });
  it("rifiuta credenziali generiche e rimuove la sessione con clear", async () => {
    expect(() => new GitHubClient("password")).toThrow();
    expect(() => new GitHubClient("ghp_CLASSIC_TOKEN_NOT_ALLOWED")).toThrow();
    const transport = mock(() => json(file()));
    const client = new GitHubClient(token, transport);
    client.clear();
    await expect(client.load()).rejects.toMatchObject({ status: 401 });
    expect(transport).not.toHaveBeenCalled();
  });
  it("verifica identità e calendario di 52 attività, senza salvare durante il login", async () => {
    const transport = mock((url, init) => {
      expect(url.startsWith("https://api.github.com/")).toBe(true);
      expect(init.method).not.toBe("PUT");
      expect(init.redirect).toBe("error");
      expect(init.credentials).toBe("omit");
      expect(init.cache).toBe("no-store");
      expect((init.headers as Record<string, string>).Authorization).toBe(
        "Bearer " + token,
      );
      expect(url).not.toContain(token);
      if (url.endsWith("/user")) return json({ login: "gestore-test" });
      if (url.endsWith("/repos/" + repository))
        return json({ full_name: repository, permissions: { push: true } });
      return json(file());
    });
    const result = await new GitHubClient(token, transport).login();
    expect(result.login).toBe("gestore-test");
    expect(result.records.activities).toHaveLength(52);
    expect(transport).toHaveBeenCalledTimes(3);
  });
  it("rifiuta un account senza autorizzazione e un calendario non valido", async () => {
    const deny = mock((url) =>
      url.endsWith("/user")
        ? json({ login: "lettore" })
        : json({ full_name: repository, permissions: { push: false } }),
    );
    await expect(new GitHubClient(token, deny).login()).rejects.toMatchObject({
      status: 403,
    });
    const bad = mock(() => json({ ...file(), content: toBase64("id\nW01") }));
    await expect(new GitHubClient(token, bad).load()).rejects.toMatchObject({
      status: 422,
    });
  });
  it("salva con SHA corrente, preserva tutti gli altri record e i dati di un altro gestore", async () => {
    const other = original.map((a) => ({ ...a }));
    other[1].note_diario = "Aggiornamento altrui da conservare";
    let body: Record<string, unknown> | undefined;
    const transport = mock((url, init) => {
      if (init.method === "PUT") {
        body = JSON.parse(String(init.body));
        return json({ content: { sha: nextSha }, commit: { sha: commit } });
      }
      return json(file(other));
    });
    const draft = {
      ...original[0],
      stato_prenotazione: "Confermata",
      data_ora_confermata: "2027-01-20T19:30",
      esito: "Fatto" as const,
      voto_ale: 9,
      note_diario: "Una bella prima volta",
    };
    const result = await new GitHubClient(token, transport).save(
      original[0],
      draft,
    );
    expect(body).toMatchObject({
      branch: "main",
      sha,
      message: "Aggiorna W01 dal pannello di gestione",
    });
    expect(JSON.stringify(body)).not.toContain(token);
    const saved = normalize(parseCSV(fromBase64(String(body!.content))));
    expect(saved[0]).toEqual(draft);
    expect(saved.slice(1)).toEqual(other.slice(1));
    expect(result.commit).toBe(commit);
  });
  it("non crea commit duplicati se il salvataggio precedente era già riuscito", async () => {
    const transport = mock(() => json(file()));
    const result = await new GitHubClient(token, transport).save(
      original[0],
      original[0],
    );
    expect(result.alreadySaved).toBe(true);
    expect(result.commit).toBeNull();
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("blocca modifiche concorrenti alla stessa attività senza inviare PUT", async () => {
    const rows = original.map((a) => ({ ...a }));
    rows[0].voto_paco = 7;
    const transport = mock(() => json(file(rows)));
    const client = new GitHubClient(token, transport);
    try {
      await client.save(original[0], { ...original[0], voto_ale: 9 });
      throw Error("doveva fallire");
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect((error as ConflictError).latest?.activities[0].voto_paco).toBe(7);
    }
    expect(transport).toHaveBeenCalledTimes(1);
  });
  it("gestisce una race SHA 409 ricaricando i dati, senza sovrascrivere", async () => {
    let gets = 0;
    const rows = original.map((a) => ({ ...a }));
    rows[0].note_diario = "Versione concorrente";
    const transport = mock((url, init) =>
      init.method === "PUT"
        ? json({}, 409)
        : json(file(++gets === 1 ? original : rows)),
    );
    const failure = await new GitHubClient(token, transport)
      .save(original[0], { ...original[0], voto_ale: 9 })
      .catch((e) => e);
    expect(failure).toBeInstanceOf(ConflictError);
    expect(failure.latest.activities[0].note_diario).toBe(
      "Versione concorrente",
    );
    expect(transport).toHaveBeenCalledTimes(3);
  });
  it.each([401, 403, 404, 422, 500])(
    "errore GitHub %s non espone credenziali o risposta remota",
    async (status) => {
      const transport = mock(() => json({ message: token }, status));
      const result = await new GitHubClient(token, transport)
        .load()
        .catch((e) => e);
      expect(result).toBeInstanceOf(GitHubError);
      expect(result.status).toBe(status);
      expect(result.message).not.toContain(token);
    },
  );
  it("una risposta di rete incerta non dichiara il dato salvato", async () => {
    const transport = mock(() => {
      throw Error("network with " + token);
    });
    const failure = await new GitHubClient(token, transport)
      .load()
      .catch((e) => e);
    expect(failure.status).toBe(0);
    expect(failure.message).not.toContain(token);
    expect(failure.message).toContain("verificare");
  });
});

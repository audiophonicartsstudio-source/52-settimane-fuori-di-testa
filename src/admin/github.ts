import {
  columns,
  normalize,
  normalizeActivity,
  parseCSV,
} from "../../scripts/data.mjs";
import type { Activity } from "../types";

export const repository =
  "audiophonicartsstudio-source/52-settimane-fuori-di-testa";
export const repositoryURL = "https://github.com/" + repository;
export const dataPath = "data/esperienze_2027.csv";
const api = "https://api.github.com";
const contentsURL = `${api}/repos/${repository}/contents/${dataPath}`;
export const createTokenURL =
  "https://github.com/settings/personal-access-tokens/new?" +
  new URLSearchParams({
    name: "Gestione 52 settimane",
    description: "Aggiornamento delle esperienze dal pannello del sito",
    target_name: "audiophonicartsstudio-source",
    expires_in: "30",
    contents: "write",
  }).toString();

export class GitHubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}
export class ConflictError extends GitHubError {
  constructor(public latest?: Records) {
    super(
      409,
      "Questa esperienza è cambiata dopo la tua apertura. Le tue modifiche sono ancora qui: confrontale con la versione salvata prima di ricaricare.",
    );
  }
}
export interface Records {
  activities: Activity[];
  sha: string;
}
export interface SavedRecords extends Records {
  commit: string | null;
  alreadySaved: boolean;
}
export function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let value = "";
  for (const b of bytes) value += String.fromCharCode(b);
  return btoa(value);
}
export function fromBase64(value: string): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(
    Uint8Array.from(atob(value.replace(/\s/g, "")), (c) => c.charCodeAt(0)),
  );
}
export function serializeCSV(activities: Activity[]): string {
  const rows = normalize(activities) as Activity[];
  const cell = (v: unknown) => {
    const text = v === null ? "" : String(v);
    return /[",\r\n]|^\s|\s$/.test(text)
      ? '"' + text.replaceAll('"', '""') + '"'
      : text;
  };
  return (
    "\uFEFF" +
    columns.join(",") +
    "\r\n" +
    rows
      .map((a) =>
        columns.map((key) => cell(a[key as keyof Activity])).join(","),
      )
      .join("\r\n") +
    "\r\n"
  );
}
export function sameActivity(a: Activity, b: Activity): boolean {
  return columns.every(
    (key) => a[key as keyof Activity] === b[key as keyof Activity],
  );
}
export function validateDraft(base: Activity, draft: Activity): Activity {
  if (
    ["id", "settimana", "settimana_inizio", "settimana_fine"].some(
      (key) => base[key as keyof Activity] !== draft[key as keyof Activity],
    )
  ) {
    throw new Error(
      "Numero e finestra della settimana non possono essere modificati. Usa la data confermata per spostare un appuntamento.",
    );
  }
  if (
    Object.values(draft).some(
      (value) =>
        typeof value === "string" &&
        /\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{20,}/.test(value),
    )
  )
    throw new Error(
      "Un campo sembra contenere una credenziale. Rimuovila: i dati delle esperienze sono pubblici.",
    );
  return normalizeActivity(draft) as Activity;
}

/** No persistence: the credential lives only in this instance until clear(). */
export class GitHubClient {
  #token: string;
  constructor(
    token: string,
    private transport: typeof fetch = (input, init) =>
      globalThis.fetch(input, init),
  ) {
    if (!/^github_pat_[A-Za-z0-9_]{20,500}$/.test(token.trim()))
      throw new GitHubError(
        401,
        "Inserisci un token GitHub fine-grained valido, che inizia con github_pat_.",
      );
    this.#token = token.trim();
  }
  clear() {
    this.#token = "";
  }
  async #request(path: string, init: RequestInit = {}) {
    if (!this.#token)
      throw new GitHubError(401, "Sessione terminata. Accedi di nuovo.");
    let response: Response;
    try {
      response = await this.transport(path, {
        ...init,
        redirect: "error",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        signal: AbortSignal.timeout(25000),
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          Authorization: "Bearer " + this.#token,
          ...(init.body ? { "Content-Type": "application/json" } : {}),
        },
      });
    } catch {
      throw new GitHubError(
        0,
        "Connessione a GitHub non riuscita. Se stavi salvando, ricarica i dati per verificare l’esito prima di riprovare.",
      );
    }
    if (!response.ok) {
      if (response.status === 409) throw new ConflictError();
      const messages: Record<number, string> = {
        401: "Token scaduto, revocato o non valido. Accedi con un nuovo token.",
        403:
          response.headers.get("x-ratelimit-remaining") === "0"
            ? "Limite temporaneo di GitHub raggiunto. Attendi prima di riprovare."
            : "GitHub non consente questa operazione. Verifica Contents: Read and write e l’accesso al solo repository del progetto.",
        404: "Il repository o il calendario non sono accessibili con questo token. Controlla il repository selezionato su GitHub.",
        422: "GitHub ha rifiutato il salvataggio. Verifica i dati e le eventuali regole del branch main.",
      };
      throw new GitHubError(
        response.status,
        messages[response.status] ||
          "GitHub non è disponibile. Riprova tra poco.",
      );
    }
    try {
      return await response.json();
    } catch {
      throw new GitHubError(
        502,
        "Risposta GitHub non leggibile. Ricarica i dati prima di salvare.",
      );
    }
  }
  async login(): Promise<{ login: string; records: Records }> {
    const user = await this.#request(api + "/user");
    if (typeof user.login !== "string" || !/^[a-zA-Z0-9-]+$/.test(user.login))
      throw new GitHubError(401, "Identità GitHub non verificabile.");
    const repo = await this.#request(api + "/repos/" + repository);
    if (repo.full_name !== repository || repo.permissions?.push === false)
      throw new GitHubError(
        403,
        "Questo account non può modificare il repository del progetto.",
      );
    return { login: user.login, records: await this.load() };
  }
  async load(): Promise<Records> {
    const file = await this.#request(contentsURL + "?ref=main");
    if (
      file.type !== "file" ||
      file.encoding !== "base64" ||
      typeof file.content !== "string" ||
      !/^[a-f0-9]{40}$/.test(file.sha) ||
      file.content.length > 3_000_000
    ) {
      throw new GitHubError(
        422,
        "Il file delle esperienze non ha il formato previsto. Nessun dato è stato modificato.",
      );
    }
    try {
      return {
        activities: normalize(parseCSV(fromBase64(file.content))) as Activity[],
        sha: file.sha,
      };
    } catch {
      throw new GitHubError(
        422,
        "Il calendario salvato non supera la validazione delle 52 esperienze. Nessun dato è stato modificato.",
      );
    }
  }
  async save(base: Activity, draft: Activity): Promise<SavedRecords> {
    const normalized = validateDraft(base, draft);
    const latest = await this.load();
    const current = latest.activities.find((a) => a.id === base.id)!;
    if (sameActivity(current, normalized))
      return { ...latest, commit: null, alreadySaved: true };
    if (!sameActivity(current, base)) throw new ConflictError(latest);
    const activities = latest.activities.map((a) =>
      a.id === normalized.id ? normalized : a,
    );
    let result;
    try {
      result = await this.#request(contentsURL, {
        method: "PUT",
        body: JSON.stringify({
          message: "Aggiorna " + normalized.id + " dal pannello di gestione",
          branch: "main",
          sha: latest.sha,
          content: toBase64(serializeCSV(activities)),
        }),
      });
    } catch (error) {
      if (error instanceof ConflictError) {
        try {
          error.latest = await this.load();
        } catch {
          /* Keep the conflict and the local draft. */
        }
      }
      throw error;
    }
    if (
      !/^[a-f0-9]{40}$/.test(result.content?.sha) ||
      !/^[a-f0-9]{40}$/.test(result.commit?.sha)
    ) {
      throw new GitHubError(
        502,
        "Il salvataggio potrebbe essere riuscito, ma manca la conferma. Ricarica i dati per verificarlo.",
      );
    }
    return {
      activities,
      sha: result.content.sha,
      commit: result.commit.sha,
      alreadySaved: false,
    };
  }
}

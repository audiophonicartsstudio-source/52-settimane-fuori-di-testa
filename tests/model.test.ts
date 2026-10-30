import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  parseCSV,
  normalize,
  validateSnapshot,
  synchronize,
} from "../scripts/data.mjs";
import {
  stats,
  filterActivities,
  emptyFilters,
  cost,
  temporal,
  nextActivity,
  romeToday,
  confirmedLabel,
  calendarDays,
  shiftMonth,
  average,
  eventDay,
} from "../src/model";
import type { Activity } from "../src/types";
const csv = fs.readFileSync("input/esperienze_2027.originale.csv", "utf8");
const activities = normalize(parseCSV(csv)) as Activity[];
const first = activities[0],
  last = activities[51];
describe("Fedeltà e contratto dei 52 dati locali", () => {
  it("valida il CSV operativo senza imporre gli esiti iniziali", () => {
    expect(
      normalize(parseCSV(fs.readFileSync("data/esperienze_2027.csv", "utf8"))),
    ).toHaveLength(52);
  });
  it("preserva tutte le righe, colonne, URL e note originali", () => {
    const original = parseCSV(csv);
    for (const a of activities) {
      const row = original.find((r) => r.id === a.id)!;
      for (const [key, value] of Object.entries(row)) {
        const actual = a[key as keyof Activity];
        expect(actual).toEqual(
          key === "settimana"
            ? Number(value)
            : key === "prezzo_persona_eur" || key.startsWith("voto_")
              ? value === ""
                ? null
                : Number(value)
              : value,
        );
      }
    }
  });
  it("verifica 52 ID, prime e ultime finestre, nessuna prenotazione e tutti da fare", () => {
    expect(activities).toHaveLength(52);
    expect(new Set(activities.map((a) => a.id)).size).toBe(52);
    expect(first.id).toBe("W01");
    expect(first.settimana_inizio).toBe("2027-01-04");
    expect(last.id).toBe("W52");
    expect(last.settimana_fine).toBe("2028-01-02");
    expect(
      activities.every(
        (a) =>
          a.esito === "Da fare" &&
          a.stato_prenotazione === "Da contattare" &&
          !a.data_ora_confermata,
      ),
    ).toBe(true);
  });
  it("correla aggiornamenti per ID anche a righe invertite", () =>
    expect(normalize(parseCSV(csv).reverse())).toEqual(activities));
  it.each(["id", "fonte_url", "voto_clelia"])(
    "rifiuta colonna mancante %s",
    (column) =>
      expect(() =>
        parseCSV(
          csv.replace(column + ",", "").replace("," + column + "\r", "\r"),
        ),
      ).toThrow(),
  );
  it("rifiuta meno di 52 righe, ID duplicati e valori errati", () => {
    expect(() => normalize(activities.slice(1))).toThrow();
    const bad = (patch: object) =>
      expect(() =>
        normalize(activities.map((a, i) => (i === 0 ? { ...a, ...patch } : a))),
      ).toThrow();
    bad({ id: "W02" });
    bad({ settimana_inizio: "2027-02-30" });
    bad({ stato_prenotazione: "Boh" });
    bad({ esito: "Completato" });
    bad({ prova_codice: "Z" });
    bad({ prezzo_persona_eur: -1 });
    bad({ voto_ale: 11 });
    bad({ voto_paco: 0 });
    bad({ fonte_url: "javascript:alert(1)" });
    bad({ foto_url: "https://user:pass@example.com" });
    bad({ data_ora_confermata: "2027-02-30T19:00" });
    bad({ data_ora_confermata: "2027-02-10T25:00" });
    bad({ settimana: 2 });
  });
  it("gestisce BOM, virgole, virgolette, CRLF e newline nelle note", () => {
    const rows = parseCSV(csv);
    rows[0].note_diario = 'Bella, "davvero"!\nDa rifare.';
    const quote = (v: string) => '"' + v.replaceAll('"', '""') + '"';
    const encoded =
      Object.keys(rows[0]).map(quote).join(",") +
      "\r\n" +
      rows.map((r) => Object.values(r).map(quote).join(",")).join("\r\n");
    expect(normalize(parseCSV("\uFEFF" + encoded))[0].note_diario).toBe(
      rows[0].note_diario,
    );
    expect(() => parseCSV('id\n"bad')).toThrow();
  });
});
describe("Statistiche, costi, filtri ed esiti", () => {
  it("non completa mai automaticamente", () => {
    expect(stats(activities, "2026-10-30")).toEqual({
      total: 52,
      done: 0,
      future: 52,
      booked: 0,
      verify: 52,
      percent: 0,
    });
    expect(stats(activities, "2029-01-01").done).toBe(0);
    expect(
      stats(
        [
          { ...first, esito: "Fatto" },
          { ...last, esito: "Saltato" },
        ],
        "2026-01-01",
      ),
    ).toMatchObject({ done: 1, percent: 50, future: 0 });
  });
  it("distingue prezzo nullo e zero, calcola costo x4 solo quando noto", () => {
    expect(cost({ ...first, prezzo_persona_eur: null })).toEqual({
      person: "Prezzo da verificare",
      group: null,
    });
    expect(cost({ ...first, prezzo_persona_eur: 0 }).person).toBe("Gratuita");
    expect(cost(first).group).toContain("60");
  });
  it("combina tutti i filtri e cerca senza distinzione maiuscole", () => {
    expect(
      filterActivities(activities, {
        ...emptyFilters,
        search: "RITRATTO",
        month: "2027-01",
        category: "Arte",
        town: "Milano",
        booking: "Da contattare",
        outcome: "Da fare",
      }),
    ).toEqual([first]);
    expect(
      filterActivities(activities, {
        ...emptyFilters,
        town: "San Donato Milanese",
      }).some((a) => a.id === "W31"),
    ).toBe(true);
    expect(
      filterActivities(activities, {
        ...emptyFilters,
        search: "impossibilexxx",
      }),
    ).toHaveLength(0);
    expect(filterActivities(activities, emptyFilters)).toHaveLength(52);
  });
  it("calcola media sui soli voti presenti e nessun falso zero", () => {
    expect(average(first)).toBeNull();
    expect(average({ ...first, voto_ale: 8, voto_paco: 10 })).toBe(9);
  });
});
describe("Tempo civile di Roma e calendario", () => {
  it("separa settimana, data confermata ed esito reale", () => {
    expect(temporal(first, "2026-10-30")).toBe("In programma");
    expect(temporal(first, "2027-01-04")).toBe("Questa settimana");
    expect(temporal(first, "2027-01-10")).toBe("Questa settimana");
    expect(temporal(first, "2027-01-11")).toContain("Da aggiornare");
    expect(
      temporal(
        { ...first, data_ora_confermata: "2027-02-14T20:30" },
        "2027-01-01",
      ),
    ).toBe("Data confermata");
  });
  it("gestisce la settimana fino al 2 gennaio 2028 incluso", () => {
    expect(temporal(last, "2028-01-02")).toBe("Questa settimana");
    expect(temporal(last, "2028-01-03")).toContain("Da aggiornare");
    expect(nextActivity(activities, "2028-01-01")?.id).toBe("W52");
  });
  it("prossima esperienza tiene conto degli spostamenti", () => {
    const moved = { ...first, data_ora_confermata: "2027-05-10T19:30" };
    expect(nextActivity([moved, activities[1]], "2027-01-01")?.id).toBe("W02");
    expect(eventDay(moved)).toBe("2027-05-10");
    expect(
      nextActivity([{ ...first, esito: "Fatto" }], "2026-10-30"),
    ).toBeNull();
  });
  it("mostra orario di Roma senza conversione implicita UTC", () => {
    expect(confirmedLabel("2027-07-10T20:30")).toContain("20:30");
    expect(romeToday(new Date("2027-01-03T23:30:00Z"))).toBe("2027-01-04");
    expect(romeToday(new Date("2027-07-03T22:30:00Z"))).toBe("2027-07-04");
  });
  it("allinea griglia lunedì, attraversa dicembre e gennaio 2028", () => {
    const days = calendarDays("2027-01");
    expect(days[0].day).toBe("2026-12-28");
    expect(days.filter((d) => d.inside)).toHaveLength(31);
    expect(shiftMonth("2027-12", 1)).toBe("2028-01");
    expect(shiftMonth("2027-01", -1)).toBe("2026-12");
  });
});
describe("Sincronizzazione e recupero", () => {
  const now = "2026-10-30T12:00:00.000Z";
  it("produce metadata reali e dataset validato", async () => {
    const result = await synchronize({
      csv: async () => csv,
      source: "local",
      now,
    });
    expect(result.meta.last_successful_sync).toBe(now);
    expect(result.meta.stale).toBe(false);
    expect(validateSnapshot(result).activities).toHaveLength(52);
  });
  it.each(["network", "empty", "invalid"])(
    "preserva ultimo snapshot valido in caso di %s",
    async (kind) => {
      const previous = await synchronize({
        csv: async () => csv,
        source: "google-sheets",
        now,
      });
      const result = await synchronize({
        csv: async () => {
          if (kind === "network") throw Error("network");
          return kind === "empty" ? "" : csv.replace("W52", "W51");
        },
        source: "google-sheets",
        previous,
        now: "2026-10-31T12:00:00Z",
      });
      expect(result.activities).toEqual(previous.activities);
      expect(result.meta.last_successful_sync).toBe(now);
      expect(result.meta.stale).toBe(true);
      expect(result.meta.sync_error).toBeTruthy();
    },
  );
  it("fallisce esplicitamente senza uno snapshot valido", async () => {
    await expect(
      synchronize({ csv: async () => "", source: "local", now }),
    ).rejects.toThrow();
    expect(() =>
      validateSnapshot({ meta: { source: "x" }, activities }),
    ).toThrow();
  });
});

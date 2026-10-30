import type { Activity, FilterState } from "./types";
export const participants = ["Ale", "Paco", "Francesca", "Clelia"] as const;
export const months = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];
export const emptyFilters: FilterState = {
  search: "",
  month: "",
  category: "",
  town: "",
  booking: "",
  outcome: "",
};
export function romeToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((t) => parts.find((p) => p.type === t)!.value)
    .join("-");
}
export function dateLabel(value: string, year = false) {
  const [y, m, d] = value.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "short",
    ...(year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
export const confirmedLabel = (value: string) =>
  dateLabel(value, true) + " · ore " + value.slice(11, 16) + " (Roma)";
export const windowLabel = (a: Activity) =>
  dateLabel(a.settimana_inizio) + " – " + dateLabel(a.settimana_fine, true);
export const eventDay = (a: Activity) =>
  a.data_ora_confermata?.slice(0, 10) || a.settimana_inizio;
export function temporal(a: Activity, today = romeToday()) {
  if (a.data_ora_confermata) return "Data confermata";
  if (today < a.settimana_inizio) return "In programma";
  if (today <= a.settimana_fine) return "Questa settimana";
  return a.esito === "Da fare"
    ? "Settimana trascorsa · Da aggiornare"
    : "Settimana trascorsa";
}
export const currency = (n: number) =>
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
export function cost(a: Activity) {
  return a.prezzo_persona_eur === null
    ? { person: "Prezzo da verificare", group: null }
    : {
        person:
          a.prezzo_persona_eur === 0
            ? "Gratuita"
            : currency(a.prezzo_persona_eur) + " / persona",
        group: currency(a.prezzo_persona_eur * 4) + " in quattro",
      };
}
export function average(a: Activity) {
  const votes = [
    a.voto_ale,
    a.voto_paco,
    a.voto_francesca,
    a.voto_clelia,
  ].filter((n): n is number => n !== null);
  return votes.length ? votes.reduce((s, n) => s + n, 0) / votes.length : null;
}
export function activityTowns(a: Activity) {
  return a.comune
    .split(" / ")
    .map((t) =>
      t === "San Donato"
        ? "San Donato Milanese"
        : t === "San Giuliano"
          ? "San Giuliano Milanese"
          : t,
    );
}
export function filterActivities(items: Activity[], f: FilterState) {
  const query = f.search.trim().toLocaleLowerCase("it");
  return items.filter(
    (a) =>
      (!query ||
        [
          a.attivita,
          a.categoria,
          a.comune,
          a.centro,
          a.sede,
          a.cosa_verificare,
          a.note_diario,
        ]
          .join(" ")
          .toLocaleLowerCase("it")
          .includes(query)) &&
      (!f.month || a.settimana_inizio.slice(0, 7) === f.month) &&
      (!f.category || a.categoria === f.category) &&
      (!f.town || activityTowns(a).includes(f.town)) &&
      (!f.booking || a.stato_prenotazione === f.booking) &&
      (!f.outcome || a.esito === f.outcome),
  );
}
export function stats(items: Activity[], today = romeToday()) {
  const done = items.filter((a) => a.esito === "Fatto").length;
  return {
    total: items.length,
    done,
    future: items.filter((a) => a.esito === "Da fare" && eventDay(a) >= today)
      .length,
    booked: items.filter((a) =>
      ["Prenotata", "Confermata"].includes(a.stato_prenotazione),
    ).length,
    verify: items.filter(
      (a) =>
        a.esito === "Da fare" &&
        !["Prenotata", "Confermata"].includes(a.stato_prenotazione),
    ).length,
    percent: items.length ? Math.round((done / items.length) * 100) : 0,
  };
}
export function nextActivity(items: Activity[], today = romeToday()) {
  return (
    items
      .filter(
        (a) =>
          a.esito === "Da fare" &&
          (a.data_ora_confermata
            ? eventDay(a) >= today
            : a.settimana_fine >= today),
      )
      .sort((a, b) => eventDay(a).localeCompare(eventDay(b)))[0] || null
  );
}
export function calendarDays(month: string) {
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1, i - offset + 1));
    return {
      day: d.toISOString().slice(0, 10),
      number: d.getUTCDate(),
      inside: d.getUTCMonth() === m - 1,
    };
  });
}
export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
}
export function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return months[m - 1] + " " + y;
}

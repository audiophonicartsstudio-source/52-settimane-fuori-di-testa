export const columns = [
  "id",
  "settimana",
  "settimana_inizio",
  "settimana_fine",
  "attivita",
  "categoria",
  "comune",
  "centro",
  "sede",
  "prezzo_persona_eur",
  "prova_codice",
  "fonte_url",
  "cosa_verificare",
  "stato_prenotazione",
  "data_ora_confermata",
  "esito",
  "note_diario",
  "foto_url",
  "voto_ale",
  "voto_paco",
  "voto_francesca",
  "voto_clelia",
];
export const bookingStates = [
  "Da contattare",
  "Contattata",
  "In attesa",
  "Prenotata",
  "Confermata",
  "Non disponibile",
  "Annullata",
];
export const outcomes = ["Da fare", "Fatto", "Saltato"];
export const proofLabels = {
  P: "Prova pubblicata",
  S: "Stagionale da riconfermare",
  V: "Da verificare",
  A: "Accesso singolo",
  I: "Idea da trovare",
};
export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [],
    cell = "",
    quoted = false,
    closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
          closed = true;
        }
      } else cell += c;
    } else if (c === '"') {
      if (cell || closed) throw Error("Virgolette CSV non valide");
      quoted = true;
    } else if (c === "," || c === "\n" || c === "\r") {
      row.push(cell);
      cell = "";
      closed = false;
      if (c !== ",") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        if (row.some((x) => x !== "")) rows.push(row);
        row = [];
      }
    } else {
      if (closed) throw Error("Testo dopo virgolette CSV");
      cell += c;
    }
  }
  if (quoted) throw Error("CSV troncato: virgolette non chiuse");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  if (rows.length < 2) throw Error("CSV vuoto o senza esperienze");
  const headers = rows.shift();
  if (new Set(headers).size !== headers.length)
    throw Error("Colonne duplicate");
  for (const c of columns)
    if (!headers.includes(c))
      throw Error("Colonna obbligatoria mancante: " + c);
  return rows.map((r, i) => {
    if (r.length !== headers.length)
      throw Error("Numero colonne non valido, riga " + (i + 2));
    return Object.fromEntries(headers.map((h, j) => [h, r[j]]));
  });
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}
export function safeURL(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return (
      ["https:", "http:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}
function number(value, min, max, name) {
  if (value === "" || value === null) return null;
  if (typeof value !== "number" && !/^\d+(?:[.,]\d+)?$/.test(value))
    throw Error(name + ": numero non valido");
  const n = Number(String(value).replace(",", "."));
  if (!Number.isFinite(n) || n < min || n > max)
    throw Error(name + ": numero fuori intervallo");
  return n;
}
export function normalize(rows) {
  if (!Array.isArray(rows) || rows.length !== 52)
    throw Error("Servono esattamente 52 attività");
  const seen = new Set();
  const result = rows.map((r) => {
    for (const c of columns) if (!(c in r)) throw Error("Campo mancante: " + c);
    const a = { ...Object.fromEntries(columns.map((c) => [c, r[c]])) };
    if (!/^W(0[1-9]|[1-4]\d|5[0-2])$/.test(a.id) || seen.has(a.id))
      throw Error("ID non valido o duplicato: " + a.id);
    seen.add(a.id);
    a.settimana = Number(a.settimana);
    if (a.settimana !== Number(a.id.slice(1)))
      throw Error(a.id + ": settimana incoerente");
    for (const c of ["attivita", "categoria", "comune", "centro", "sede"])
      if (typeof a[c] !== "string" || !a[c].trim())
        throw Error(a.id + ": " + c + " vuoto");
    for (const c of ["settimana_inizio", "settimana_fine"])
      if (!validDate(a[c])) throw Error(a.id + ": data non valida");
    // The planned project windows remain the original 52 contiguous weeks.
    const start = new Date(Date.UTC(2027, 0, 4 + (a.settimana - 1) * 7))
      .toISOString()
      .slice(0, 10);
    const end = new Date(Date.UTC(2027, 0, 10 + (a.settimana - 1) * 7))
      .toISOString()
      .slice(0, 10);
    if (a.settimana_inizio !== start || a.settimana_fine !== end)
      throw Error(
        a.id +
          ": finestra prevista incoerente; usare data_ora_confermata per spostare",
      );
    if (!bookingStates.includes(a.stato_prenotazione))
      throw Error(a.id + ": stato prenotazione non valido");
    if (!outcomes.includes(a.esito)) throw Error(a.id + ": esito non valido");
    if (!Object.hasOwn(proofLabels, a.prova_codice))
      throw Error(a.id + ": codice prova non valido");
    const dt = a.data_ora_confermata;
    if (
      dt &&
      (!/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(dt) ||
        !validDate(dt.slice(0, 10)))
    )
      throw Error(a.id + ": data confermata non valida");
    for (const c of ["fonte_url", "foto_url"])
      if (!safeURL(a[c])) throw Error(a.id + ": URL non valido");
    for (const c of columns.filter((c) => c.startsWith("voto_")))
      a[c] = number(a[c], 1, 10, c);
    a.prezzo_persona_eur = number(
      a.prezzo_persona_eur,
      0,
      Number.MAX_SAFE_INTEGER / 4,
      "prezzo",
    );
    for (const c of columns.filter(
      (c) =>
        !["settimana", "prezzo_persona_eur"].includes(c) &&
        !c.startsWith("voto_"),
    ))
      if (typeof a[c] !== "string")
        throw Error(a.id + ": campo testuale non valido " + c);
    return a;
  });
  return result.sort((a, b) => a.settimana - b.settimana);
}
export function validateSnapshot(value) {
  if (
    !value ||
    !value.meta ||
    !["local", "google-sheets"].includes(value.meta.source)
  )
    throw Error("Metadata non validi");
  if (!Number.isFinite(Date.parse(value.meta.last_successful_sync)))
    throw Error("Timestamp sync non valido");
  return { ...value, activities: normalize(value.activities) };
}
export async function synchronize({
  csv,
  previous = null,
  source,
  now = new Date().toISOString(),
}) {
  try {
    const activities = normalize(parseCSV(await csv()));
    return {
      meta: {
        source,
        last_successful_sync: now,
        last_attempt: now,
        stale: false,
        sync_error: null,
      },
      activities,
    };
  } catch (error) {
    if (!previous) throw error;
    const fallback = validateSnapshot(previous);
    return {
      ...fallback,
      meta: {
        ...fallback.meta,
        last_attempt: now,
        stale: true,
        sync_error:
          "Aggiornamento non riuscito. È disponibile l’ultimo calendario valido.",
      },
    };
  }
}

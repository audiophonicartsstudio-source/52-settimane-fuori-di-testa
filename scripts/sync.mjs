import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { synchronize, validateSnapshot } from "./data.mjs";
async function readJSON(path) {
  try {
    return validateSnapshot(JSON.parse(await readFile(path, "utf8")));
  } catch {
    return null;
  }
}
async function atomic(path, data) {
  await writeFile(path + ".tmp", JSON.stringify(data, null, 2) + "\n");
  await rename(path + ".tmp", path);
}
export async function runSync() {
  await mkdir("public/data", { recursive: true });
  await mkdir(".cache", { recursive: true });
  const url = process.env.SHEETS_CSV_URL?.trim();
  const source = url ? "google-sheets" : "local";
  const cached = await readJSON(".cache/esperienze.json");
  const local = await readJSON("data/esperienze_2027.json");
  const previous = url
    ? cached?.meta.source === "google-sheets"
      ? cached
      : local
    : local;
  const csv = async () => {
    if (!url) return readFile("data/esperienze_2027.csv", "utf8");
    const u = new URL(url);
    if (
      u.protocol !== "https:" ||
      !["docs.google.com", "docs.googleusercontent.com"].includes(u.hostname)
    )
      throw Error("Usare URL HTTPS CSV pubblico di Google Sheets");
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw Error("Download Sheets HTTP " + response.status);
    const text = await response.text();
    if (text.length > 2_000_000) throw Error("CSV troppo grande");
    return text;
  };
  const snapshot = await synchronize({ csv, previous, source });
  if (snapshot.meta.stale) {
    console.warn(
      "::warning::Sincronizzazione fallita: conservato ultimo snapshot valido. Origine: " +
        snapshot.meta.source,
    );
  } else if (source === "local") {
    // Do not invent a new data update time when unchanged local data is rebuilt.
    if (
      local &&
      JSON.stringify(local.activities) === JSON.stringify(snapshot.activities)
    )
      snapshot.meta.last_successful_sync = local.meta.last_successful_sync;
    await atomic("data/esperienze_2027.json", snapshot);
  }
  if (!snapshot.meta.stale) await atomic(".cache/esperienze.json", snapshot);
  await atomic("public/data/esperienze.json", snapshot);
  console.log(
    "Dataset verificato: " +
      snapshot.activities.length +
      " ID W01–W52 · " +
      snapshot.meta.source +
      (snapshot.meta.stale ? " · snapshot precedente" : ""),
  );
}
if (import.meta.url === pathToFileURL(process.argv[1] || "").href)
  runSync().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });

import { it, expect } from "vitest";
import { mkdtemp, mkdir, readFile, writeFile, rm, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
import { normalize, parseCSV } from "../scripts/data.mjs";
import { serializeCSV } from "../src/admin/github";
const script = resolve("scripts/sync.mjs");
async function sandbox(run: (dir: string) => Promise<void>) {
  const dir = await mkdtemp(join(tmpdir(), "52-settimane-test-"));
  try {
    await mkdir(join(dir, "data"));
    const csv = await readFile("input/esperienze_2027.originale.csv", "utf8");
    await writeFile(join(dir, "data/esperienze_2027.csv"), csv);
    await writeFile(
      join(dir, "data/esperienze_2027.json"),
      JSON.stringify({
        meta: {
          source: "local",
          last_successful_sync: "2026-10-30T10:00:00Z",
          last_attempt: "2026-10-30T10:00:00Z",
          stale: false,
          sync_error: null,
        },
        activities: normalize(parseCSV(csv)),
      }),
    );
    await run(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
it("la CLI conserva byte per byte lo snapshot Sheets dopo errore e pubblica avviso senza toccare il locale", async () => {
  await sandbox(async (dir) => {
    await mkdir(join(dir, ".cache"));
    const local = await readFile(
      join(dir, "data/esperienze_2027.json"),
      "utf8",
    );
    const last = JSON.parse(local);
    last.meta.source = "google-sheets";
    last.meta.last_successful_sync = "2026-10-29T10:00:00Z";
    last.activities[0].esito = "Fatto";
    const original = JSON.stringify(last);
    await writeFile(join(dir, ".cache/esperienze.json"), original);
    execFileSync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, SHEETS_CSV_URL: "http://invalid.example" },
      stdio: "pipe",
    });
    expect(await readFile(join(dir, ".cache/esperienze.json"), "utf8")).toBe(
      original,
    );
    expect(await readFile(join(dir, "data/esperienze_2027.json"), "utf8")).toBe(
      local,
    );
    const published = JSON.parse(
      await readFile(join(dir, "public/data/esperienze.json"), "utf8"),
    );
    expect(published.meta).toMatchObject({
      source: "google-sheets",
      last_successful_sync: "2026-10-29T10:00:00Z",
      stale: true,
    });
    expect(published.activities[0].esito).toBe("Fatto");
  });
});
it("build locali immutate non inventano nuove date di aggiornamento", async () => {
  await sandbox(async (dir) => {
    const before = JSON.parse(
      await readFile(join(dir, "data/esperienze_2027.json"), "utf8"),
    );
    execFileSync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, SHEETS_CSV_URL: "" },
      stdio: "pipe",
    });
    const after = JSON.parse(
      await readFile(join(dir, "public/data/esperienze.json"), "utf8"),
    );
    expect(after.meta.last_successful_sync).toBe(
      before.meta.last_successful_sync,
    );
    expect(after.meta.stale).toBe(false);
    expect(after.activities).toEqual(before.activities);
  });
});

it("un salvataggio del pannello aggiorna JSON e cache senza richiedere modifiche manuali al fallback", async () => {
  await sandbox(async (dir) => {
    const before = JSON.parse(
      await readFile(join(dir, "data/esperienze_2027.json"), "utf8"),
    );
    const rows = structuredClone(before.activities);
    rows[0].voto_ale = 9;
    rows[0].esito = "Fatto";
    await writeFile(join(dir, "data/esperienze_2027.csv"), serializeCSV(rows));
    execFileSync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, SHEETS_CSV_URL: "" },
      stdio: "pipe",
    });
    const updated = JSON.parse(
      await readFile(join(dir, "public/data/esperienze.json"), "utf8"),
    );
    expect(updated.activities).toEqual(rows);
    expect(updated.meta.last_successful_sync).not.toBe(
      before.meta.last_successful_sync,
    );
    // Simulate a fresh Actions checkout: JSON is the older committed fallback, CSV is canonical.
    await writeFile(
      join(dir, "data/esperienze_2027.json"),
      JSON.stringify(before),
    );
    execFileSync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, SHEETS_CSV_URL: "" },
      stdio: "pipe",
    });
    const rebuilt = JSON.parse(
      await readFile(join(dir, "public/data/esperienze.json"), "utf8"),
    );
    expect(rebuilt.activities).toEqual(rows);
    expect(rebuilt.meta.last_successful_sync).toBe(
      updated.meta.last_successful_sync,
    );
    await writeFile(join(dir, "data/esperienze_2027.csv"), "CSV non valido");
    execFileSync(process.execPath, [script], {
      cwd: dir,
      env: { ...process.env, SHEETS_CSV_URL: "" },
      stdio: "pipe",
    });
    const fallback = JSON.parse(
      await readFile(join(dir, "public/data/esperienze.json"), "utf8"),
    );
    expect(fallback.activities).toEqual(rows);
    expect(fallback.meta.stale).toBe(true);
  });
});

import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import type { Activity } from "../../src/types";
import { normalize, parseCSV } from "../../scripts/data.mjs";
import {
  repository,
  toBase64,
  fromBase64,
  serializeCSV,
} from "../../src/admin/github";
const token = "github_pat_TEST_ONLY_NOT_A_REAL_TOKEN";
const originals = normalize(
  parseCSV(fs.readFileSync("input/esperienze_2027.originale.csv", "utf8")),
) as Activity[];
async function mockGitHub(
  page: Page,
  mode: "ok" | "unauthorized" | "readonly" | "conflict" = "ok",
) {
  let rows = structuredClone(originals),
    puts = 0,
    sha = "a".repeat(40),
    loads = 0;
  await page.route("https://api.github.com/**", async (route) => {
    const req = route.request();
    expect(req.headers().authorization).toBe("Bearer " + token);
    expect(req.url()).not.toContain(token);
    if (mode === "unauthorized")
      return route.fulfill({ status: 401, json: { message: "Unauthorized" } });
    if (req.url().endsWith("/user"))
      return route.fulfill({ json: { login: "gestore-test" } });
    if (req.url().endsWith("/repos/" + repository))
      return route.fulfill({
        json: { full_name: repository, permissions: { push: true } },
      });
    if (req.method() === "PUT") {
      puts++;
      if (mode === "readonly")
        return route.fulfill({ status: 403, json: { message: "Forbidden" } });
      const data = req.postDataJSON();
      expect(data.sha).toBe(sha);
      expect(data.branch).toBe("main");
      expect(req.postData()).not.toContain(token);
      rows = normalize(parseCSV(fromBase64(data.content))) as Activity[];
      sha = "b".repeat(40);
      return route.fulfill({
        json: { content: { sha }, commit: { sha: "c".repeat(40) } },
      });
    }
    loads++;
    if (mode === "conflict" && loads === 2)
      rows[0].note_diario = "Nota salvata da un altro gestore";
    return route.fulfill({
      json: {
        type: "file",
        encoding: "base64",
        content: toBase64(serializeCSV(rows)),
        sha,
      },
    });
  });
  await page.route("**/data/esperienze.json*", (route) =>
    route.fulfill({
      json: {
        meta: {
          source: "local",
          last_successful_sync: "2026-10-30T12:00:00Z",
          last_attempt: "2026-10-30T12:00:00Z",
          stale: false,
          sync_error: null,
        },
        activities: rows,
      },
    }),
  );
  return { rows: () => rows, puts: () => puts };
}
async function login(page: Page) {
  await page.goto("gestione.html");
  await page.getByLabel("Token di accesso GitHub", { exact: true }).fill(token);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
}
test("accesso obbligatorio, salvataggio condiviso, pubblicazione e uscita senza persistenza del token", async ({
  page,
}) => {
  const server = await mockGitHub(page);
  await page.goto("");
  await page.getByRole("link", { name: "Gestione", exact: true }).click();
  const policy = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .getAttribute("content");
  expect(policy).toContain("script-src 'self'");
  expect(policy).not.toContain("unsafe-inline");
  await expect(
    page.getByRole("button", { name: "Salva esperienza" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Entra nella gestione" }),
  ).toBeVisible();
  await page.getByLabel("Token di accesso GitHub", { exact: true }).fill(token);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Gestione esperienze" }),
  ).toBeVisible();
  await page.getByLabel("Stato della prenotazione").selectOption("Confermata");
  await page
    .getByLabel("Data e ora confermata", { exact: true })
    .fill("2027-01-20T19:30");
  await page.getByLabel("Esito dell’esperienza").selectOption("Fatto");
  await page
    .getByLabel("Note del diario")
    .fill('È stato divertente, "davvero"!');
  for (const [name, vote] of [
    ["Ale", "9"],
    ["Paco", "8"],
    ["Francesca", "7"],
    ["Clelia", "10"],
  ])
    await page.getByLabel("Voto " + name, { exact: true }).fill(vote);
  await page
    .getByRole("button", { name: "Salva esperienza", exact: true })
    .click();
  await expect(
    page.getByText("Esperienza salvata nell’archivio condiviso.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("W01 è aggiornato sul sito.", { exact: true }),
  ).toBeVisible();
  expect(server.rows()[0]).toMatchObject({
    stato_prenotazione: "Confermata",
    data_ora_confermata: "2027-01-20T19:30",
    esito: "Fatto",
    voto_ale: 9,
    voto_paco: 8,
    voto_francesca: 7,
    voto_clelia: 10,
  });
  expect(server.rows().slice(1)).toEqual(originals.slice(1));
  expect(server.puts()).toBe(1);
  expect(
    await page.evaluate(() =>
      JSON.stringify({
        local: { ...localStorage },
        session: { ...sessionStorage },
      }),
    ),
  ).not.toContain(token);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Esci", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Entra nella gestione" }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Token di accesso GitHub", { exact: true }),
  ).toHaveValue("");
  await login(page);
  await expect(page.getByLabel("Voto Ale", { exact: true })).toHaveValue("9");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Entra nella gestione" }),
  ).toBeVisible();
  expect(server.puts()).toBe(1);
});
test("token errato e accesso in sola lettura non salvano i dati", async ({
  page,
}) => {
  const server = await mockGitHub(page, "unauthorized");
  await login(page);
  await expect(page.getByRole("alert")).toContainText("Token scaduto");
  await expect(
    page.getByRole("button", { name: "Salva esperienza" }),
  ).toHaveCount(0);
  expect(server.puts()).toBe(0);
});
test("permessi insufficienti conservano il modulo e mostrano un errore", async ({
  page,
}) => {
  const server = await mockGitHub(page, "readonly");
  await login(page);
  await page.getByLabel("Voto Ale", { exact: true }).fill("8");
  await page
    .getByRole("button", { name: "Salva esperienza", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Read and write");
  await expect(page.getByLabel("Voto Ale", { exact: true })).toHaveValue("8");
  expect(server.rows()).toEqual(originals);
});
test("modifiche non salvate protette e conflitti confrontabili senza sovrascrittura", async ({
  page,
}) => {
  const server = await mockGitHub(page, "conflict");
  await login(page);
  await page.getByLabel("Voto Ale", { exact: true }).fill("9");
  await page.getByRole("button", { name: "Esci", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Continua a modificare" }).click();
  await expect(page.getByLabel("Voto Ale", { exact: true })).toHaveValue("9");
  await page
    .getByRole("button", { name: "Salva esperienza", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Confronta le versioni" }),
  ).toBeVisible();
  expect(server.puts()).toBe(0);
  await page
    .getByRole("button", {
      name: "Riporta le mie modifiche sulla versione aggiornata",
    })
    .click();
  await expect(page.getByLabel("Note del diario")).toHaveValue(
    "Nota salvata da un altro gestore",
  );
  await expect(page.getByLabel("Voto Ale", { exact: true })).toHaveValue("9");
  await page
    .getByRole("button", { name: "Salva esperienza", exact: true })
    .click();
  await expect(
    page.getByText("Esperienza salvata nell’archivio condiviso.", {
      exact: true,
    }),
  ).toBeVisible();
  expect(server.rows()[0]).toMatchObject({
    voto_ale: 9,
    note_diario: "Nota salvata da un altro gestore",
  });
  expect(server.puts()).toBe(1);
});

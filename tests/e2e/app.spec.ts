import { test, expect } from "@playwright/test";
test("52 attività, filtri combinati, dettagli, Esc e ripristino focus", async ({
  page,
}) => {
  await page.goto("");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "52 settimane",
  );
  await expect(page.getByTestId("activity-card")).toHaveCount(52);
  await expect(
    page.getByText("Ale, Paco, Francesca e Clelia", { exact: true }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("ceramica");
  await expect(page.getByTestId("activity-card")).toHaveCount(1);
  const opener = page.getByRole("button", {
    name: "Dettagli: Ceramica al tornio: introduzione",
    exact: true,
  });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("definition")
      .filter({ hasText: /^Gratuita/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog").getByText("Non ancora concordata"),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.getByRole("button", { name: "Azzera filtri" }).click();
  await page.getByRole("button", { name: "Ago", exact: true }).click();
  await expect(page.getByTestId("activity-card")).toHaveCount(5);
  await page.getByLabel("Categoria", { exact: true }).selectOption("Cucina");
  await expect(page.getByTestId("activity-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Azzera filtri" }).click();
  await expect(page.getByTestId("activity-card")).toHaveCount(52);
});
test("calendario interattivo, ultima settimana, dati onesti e layout", async ({
  page,
}) => {
  await page.goto("");
  await page.getByRole("button", { name: "Calendario", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Gennaio 2027", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mese successivo" }).click();
  await expect(
    page.getByRole("heading", { name: "Febbraio 2027", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dic", exact: true }).click();
  await page.getByRole("button", { name: "Mese successivo" }).click();
  await expect(
    page.getByRole("heading", { name: "Gennaio 2028", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /W52.*Magia/ })).toBeVisible();
  await page.getByRole("button", { name: /W52.*Magia/ }).click();
  await expect(page.getByRole("dialog")).toContainText("2 gen 2028");
  await expect(page.getByRole("dialog")).toContainText("Prezzo da verificare");
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Apri la scuola" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Chiudi dettagli" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByText("Le prime volte non si dimenticano."),
  ).toBeVisible();
});
test("fallback recuperabile se asset di aggiornamento non raggiungibile", async ({
  page,
}) => {
  await page.route("**/data/esperienze.json", (r) => r.abort());
  await page.goto("");
  await expect(
    page.getByText(/Il calendario aggiornato non è raggiungibile/),
  ).toBeVisible();
  await expect(page.getByTestId("activity-card")).toHaveCount(52);
  await page.unroute("**/data/esperienze.json");
  await page.getByRole("button", { name: "Riprova", exact: true }).click();
  await expect(
    page.getByText(/Il calendario aggiornato non è raggiungibile/),
  ).toHaveCount(0);
});

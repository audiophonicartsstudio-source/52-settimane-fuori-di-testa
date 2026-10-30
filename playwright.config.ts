import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4173/52-settimane-fuori-di-testa/",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command:
      "npm run preview -- --port 4173 --strictPort --base=/52-settimane-fuori-di-testa/",
    url: "http://127.0.0.1:4173/52-settimane-fuori-di-testa/",
    reuseExistingServer: !process.env.CI,
  },
});

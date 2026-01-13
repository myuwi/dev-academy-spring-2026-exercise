import { test, expect } from "@playwright/test";

test.describe("Stats page", () => {
  test("should load and display the title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Electricity Statistics/);
    await expect(page.locator("h1")).toHaveText(/Electricity Statistics/);
  });
});

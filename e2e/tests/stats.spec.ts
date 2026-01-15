import { test, expect } from "@playwright/test";

test.describe("Stats page", () => {
  test("user opens the page and sees page content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Electricity Statistics/);
    await expect(page.locator("h1")).toHaveText(/Electricity Statistics/);
  });

  test.describe("Search", () => {
    test("user types a query and sees only matching rows", async ({ page }) => {
      await page.goto("/?pageSize=50");
      await page.getByRole("search", { name: "Search bar" }).fill("2023-01");
      await page.getByRole("search", { name: "Search bar" }).press("Enter");

      await expect(page).toHaveURL(/q=2023-01/);

      await page
        .getByRole("cell", { name: /2023-01-/ })
        .first()
        .waitFor();

      for (const row of await page.locator("tbody > tr").all()) {
        await expect(row).toHaveText(/2023-01-/);
      }
    });

    test("user clears the search and gets back the full list", async ({ page }) => {
      await page.goto("/?q=2023-01-24");

      await expect(page.locator("tbody > tr")).toHaveCount(1);

      await page.getByRole("button", { name: "Clear Search" }).click();

      await expect(page).toHaveURL((url) => !url.searchParams.has("q"));
      await expect(page.locator("tbody > tr")).toHaveCount(10);
    });

    test("user types a query matching no rows and sees no results", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("search", { name: "Search bar" }).fill("foo");
      await page.getByRole("search", { name: "Search bar" }).press("Enter");

      await expect(page.locator("tbody > tr")).toHaveCount(0);
    });

    test("user types a query and then changes page size; results stay filtered", async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("search", { name: "Search bar" }).fill("2023-01-24");
      await page.getByRole("search", { name: "Search bar" }).press("Enter");

      await expect(page.locator("tbody > tr")).toHaveCount(1);

      await page.getByLabel("Show per page").selectOption("50");

      await expect(page.locator("tbody > tr")).toHaveCount(1);
    });
  });

  test.describe("Sorting", () => {
    test("user clicks a column header once -> descending, twice -> ascending, third time -> back to descending", async ({
      page,
    }) => {
      await page.goto("/");

      const totalProductionHeader = page.getByText(/Total Production/);

      await totalProductionHeader.click();
      await expect(totalProductionHeader.getByLabel("Descending")).toBeVisible();

      await totalProductionHeader.click();
      await expect(totalProductionHeader.getByLabel("Ascending")).toBeVisible();

      await totalProductionHeader.click();
      await expect(totalProductionHeader.getByLabel("Descending")).toBeVisible();
    });

    test("user sorts while on page 3; lands on first page and table stays sorted", async ({
      page,
    }) => {
      await page.goto("/?page=3");

      const totalProductionHeader = page.getByText(/Total Production/);
      await totalProductionHeader.click();

      await expect(page.getByRole("textbox", { name: "Current Page Number" })).toHaveValue("1");
      await expect(totalProductionHeader.getByLabel("Descending")).toBeVisible();
    });
  });

  test.describe("Pagination", () => {
    test("user clicks on 'Next Page' three times; arrives on page 4", async ({ page }) => {
      await page.goto("/");

      const nextPageButton = page.getByRole("button", { name: "Next Page" });
      await nextPageButton.click();
      await nextPageButton.click();
      await nextPageButton.click();

      await expect(page).toHaveURL(/page=4/);

      await expect(page.getByRole("textbox", { name: "Current Page Number" })).toHaveValue("4");
    });

    test("user switches from 15 to 50 rows per page, and table row count changes to reflect selection", async ({
      page,
    }) => {
      await page.goto("/?pageSize=15");

      const table = page.getByRole("table", { name: "Data Table" });

      await expect(table.locator("tbody > tr")).toHaveCount(15);

      await page.getByLabel("Show per page").selectOption("50");

      await expect(table.locator("tbody > tr")).toHaveCount(50);
    });

    test("user changes rows per page, and is navigated to the first page while retaining selection", async ({
      page,
    }) => {
      await page.goto("/?page=3");

      const table = page.getByRole("table", { name: "Data Table" });

      await page.getByLabel("Show per page").selectOption("50");

      await expect(page).toHaveURL((url) => !url.searchParams.has("page"));

      await expect(page.getByRole("textbox", { name: "Current Page Number" })).toHaveValue("1");

      await expect(table.locator("tbody > tr")).toHaveCount(50);
    });
  });
});

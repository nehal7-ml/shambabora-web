import { test, expect } from "@playwright/test";
import { sleep } from "../../../../utls";
test("Create → Edit -> View → Delete a Farmer", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect(page).toHaveURL(/dashboard/i, { timeout: 7000 });
  await page.getByRole("link", { name: 'Farmers', exact: true }).click();
  await expect(page).toHaveURL("/dashboard/farmers");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const uniqueSuffix = Date.now();
  const originalFirstName = `TestFirst-${uniqueSuffix}`;
  const updatedFirstName = `${originalFirstName}-Edited`;


  await test.step("Create Farm", async () => {
    const row = page.locator("tr").nth(1);
    if (!row) {
      throw new Error("No farmers to view");
    }
    const kebab = row.locator('td > button[aria-haspopup="menu"]').first();

    await kebab.click();

    await page.getByRole("menuitem", { name: /view/i }).click();
    await expect(page).toHaveURL(/farmer-harvests/i);

    await page.locator("button", { hasText: /Add Farm/i }).click();

    const firstNameInput = page.getByPlaceholder("Enter Farm Name");
    const sizeInput = page.getByPlaceholder("Enter Farm Size");
    const locationInputX = page.getByPlaceholder("X coordinate").first();
    const locationInputY = page.getByPlaceholder("Y coordinate").first();
    const numberOfTreesInput = page.getByPlaceholder("Enter Number of Trees");

    await firstNameInput.fill(updatedFirstName);
    await sizeInput.fill("1000");
    await locationInputX.fill("172.123456");
    await locationInputY.fill("12.123456");
    await numberOfTreesInput.fill("100");

    await page.locator("button[role=combobox]", { hasText: /Select AMCOS/i }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: /Create Farm/i }).click();
    await sleep(3000)
    // clieck on fgarms buttontop view list
    await page.locator("button", { hasText: /Farms/i }).click();


    await expect(page.getByText(originalFirstName)).toBeVisible();
  });

  await test.step("Edit Farm", async () => {
    const row = page.locator("div[role=farm-card]", { hasText: originalFirstName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const firstNameInput = page.getByPlaceholder("Enter Farm Name");
    await firstNameInput.fill(updatedFirstName);
    await page.getByRole("button", { name: /Update Farm/i }).click();
    await sleep(1000);




    await expect(page.getByText(updatedFirstName)).toBeVisible();
  });

  await test.step("Delete Farm", async () => {
    const row = page.locator("div[role=farm-card]", { hasText: updatedFirstName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /Delete/i }).click();
    await page.getByRole("button", { name: /Delete/i }).click();
    await sleep(1000);

    await expect(page.getByText(updatedFirstName)).toHaveCount(0);
  });
});

import { test, expect } from "@playwright/test";

test("Create → Edit → Delete AMCOS", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect(page).toHaveURL(/dashboard/i, { timeout: 6000 });

  await page.getByRole("button", { name: "Manage Amcos", exact: true }).click();
  await page.getByRole("link", { name: "Amcos", exact: true }).click();
  await expect(page).toHaveURL("/dashboard/amcos");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const uniqueSuffix = Date.now();
  const originalName = `Test Amcos ${uniqueSuffix}`;
  const updatedName = `${originalName} Updated`;

  await test.step("Create AMCOS", async () => {
    await page.getByRole("button", { name: /add amcos/i }).click();

    await page.getByPlaceholder("Enter AMCOS Name").fill(originalName);

    await page.locator("button[role='combobox']", { hasText: /Select Member Category/i }).click();
    await page.getByRole("option", { name: /individual/i }).click();

    await page.getByPlaceholder("Enter Registration Number").fill(`REG-${uniqueSuffix}`);
    await page.getByPlaceholder("Enter TIN Number").fill(`TIN-${uniqueSuffix}`);

    await page.locator("button[role='combobox']", { hasText: /Select MCU/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role='combobox']", { hasText: /Select Region/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role='combobox']", { hasText: /Select District/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role='combobox']", { hasText: /Select ward/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role='combobox']", { hasText: /Select village/i }).click();
    await page.getByRole("option").first().click();

    await page.getByPlaceholder("Enter Address").fill("123 Test Street");
    await page.getByPlaceholder("Enter Phone Number").fill("0712345678");
    await page.getByPlaceholder("Enter Email").fill(`testamcos${uniqueSuffix}@mail.com`);
    await page.getByPlaceholder("Enter Website").fill(`https://testamcos${uniqueSuffix}.com`);

    await page.getByRole("button", { name: /create amcos/i }).click();

    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    await expect(page.getByText(originalName)).toBeVisible();
  });

  await test.step("Edit AMCOS", async () => {
    const row = page.locator("tr", { hasText: originalName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const nameInput = page.getByPlaceholder("Enter AMCOS Name");
    await nameInput.fill(updatedName);

    await page.getByRole("button", { name: /update amcos/i }).click();

    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    await expect(page.getByText(updatedName)).toBeVisible();
  });

  await test.step("Delete AMCOS", async () => {
    const row = page.locator("tr", { hasText: updatedName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /delete/i }).click();
    await page.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByText(updatedName)).toHaveCount(0);
  });
});

import { test, expect } from "@playwright/test";

test("Create → Edit → Delete a Farmer", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect(page).toHaveURL(/dashboard/i, { timeout: 6000 });
  await page.getByRole("link", { name: 'Farmers', exact: true }).click();
  await expect(page).toHaveURL("/dashboard/farmers");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const uniqueSuffix = Date.now();
  const originalFirstName = `TestFirst-${uniqueSuffix}`;
  const updatedFirstName = `${originalFirstName}-Edited`;

  await test.step("Create Farmer", async () => {
    await page.getByRole("button", { name: "Add Farmer" }).click();

    await page.getByPlaceholder("Enter First Name").fill(originalFirstName);
    await page.getByPlaceholder("Enter Last Name").fill("TestLast");
    await page.getByPlaceholder("Enter Date of Birth").fill("1990-01-01");

    await page.locator("button[role=combobox]", { hasText: /Select ID Type/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role=combobox]", { hasText: /Select sex/i }).click();
    await page.getByRole("option", { name: 'Male', exact: true }).click();

    await page.getByPlaceholder("Enter ID number").fill(`ID-${uniqueSuffix}`);
    await page.getByPlaceholder("Enter Phone Number").fill("0712345678");
    await page.getByPlaceholder("Enter AMCOS Member ID").fill(`AMC-${uniqueSuffix}`);

    await page.locator("button[role=combobox]", { hasText: /Select Education Level/i }).click();
    await page.getByRole("option", { name: 'Primary', exact: true }).click();

    await page.getByRole("button", { name: /Create Farmer/i }).click();

    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    await expect(page.getByText(originalFirstName)).toBeVisible();
  });

  await test.step("Edit Farmer", async () => {
    const row = page.locator("tr", { hasText: originalFirstName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const firstNameInput = page.getByPlaceholder("Enter First Name");
    await firstNameInput.fill(updatedFirstName);

    await page.getByRole("button", { name: /Update Farmer/i }).click();
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    await expect(page.getByText(updatedFirstName)).toBeVisible();
  });

  await test.step("Delete Farmer", async () => {
    const row = page.locator("tr", { hasText: updatedFirstName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /Delete/i }).click();
    await page.getByRole("button", { name: /Delete/i }).click();

    await expect(page.getByText(updatedFirstName)).toHaveCount(0);
  });
});

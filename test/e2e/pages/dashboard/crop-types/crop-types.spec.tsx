
import { test, expect } from "@playwright/test";
import { sleep } from "../../../../utls";

test("Navigation on the Crop types page", async ({ page }) => {
  await page.goto("/sign-in");


  //  These e-mail and password need to be externilized so that we can do multiple user tests
  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");

  // 6. Optional: Click the submit button if available
  const loginButton = page.getByRole("button", { name: /sign in|login/i });
  if (await loginButton.isVisible()) {
    await loginButton.click();
  }

  await expect(page).toHaveURL(/dashboard/i);

  await expect(page).toHaveTitle(/Shamba Bora/);

  await page.getByRole("button", { name: /Manage Crops/i }).click();
  await page.getByRole("link", { name: /Crop Type/i }).click();

  await expect(page).toHaveURL("/dashboard/crop-types");

  await page.getByText(/loading ...../i).waitFor({ state: "detached" });

  await expect(page.getByRole("heading", { name: "Crop Types" })).toBeVisible();
  await expect(page.getByText(/Here's a list of your Crop Types/i)).toBeVisible();

});


test("Create → Edit → Delete a Crop Type", async ({ page }) => {
  await page.goto("/sign-in");

  // Auth
  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  // Navigate to crop types page
  await page.getByRole("button", { name: /Manage Crops/i }).click();
  await page.getByRole("link", { name: /Crop type/i }).click();
  await expect(page).toHaveURL("/dashboard/crop-types");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const originalName = `CropType-${Date.now()}`;
  const updatedName = `${originalName}-edited`;

  await test.step("Create crop type", async () => {
    await page.getByRole("button", { name: "Add Crop Type" }).click();
    await page.getByPlaceholder("Enter CropType name").fill(originalName);

    await page.getByRole("button", { name: /create/i }).click();
    await sleep(2000);
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    const newRow = page.locator("tbody tr", { hasText: originalName });
    await expect(newRow).toBeVisible();
  });

  await test.step("Edit crop type", async () => {
    const row = page.locator("tr", { hasText: originalName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const input = page.getByPlaceholder("Enter CropType name");
    await input.fill(updatedName);

    await page.getByRole("button", { name: /update/i }).click();
    await sleep(1000);
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    const updatedRow = page.locator("tbody tr", { hasText: updatedName });
    await expect(updatedRow).toBeVisible();
  });

  await test.step("Delete crop type", async () => {
    const row = page.locator("tr", { hasText: updatedName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /delete/i }).click();

    // Confirm deletion
    const confirm = page.getByRole("button", { name: /confirm|delete/i });
    await confirm.click();
    await sleep(1000);
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }

    await expect(page.locator("tbody tr", { hasText: updatedName })).toHaveCount(0);
  });
});

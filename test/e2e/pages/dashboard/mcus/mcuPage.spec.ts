
import { test, expect } from "@playwright/test";
import { sleep } from "../../../../utls";

test("Navigation on the Manage Amcos menu", async ({ page }) => {
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

  await expect(page).toHaveURL(/dashboard/i);

  await expect(page).toHaveTitle(/Shamba Bora/);

  await page.getByRole("button", { name: /Manage Amcos/i }).click();
  await page.getByRole("link", { name: /Mcu/i }).click();

  await expect(page).toHaveURL("/dashboard/mcus");

  await page.getByText(/loading ...../i).waitFor({ state: "detached" });

  await expect(page.getByRole("heading", { name: "Mcu" })).toBeVisible();
  await expect(page.getByText(/Here's a list of your MCUs/i)).toBeVisible();


});


test("Create → Edit → Delete an MCU", async ({ page }) => {
  await page.goto("/sign-in", { timeout: 60000 });

  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await page.getByRole("button", { name: /Manage Amcos/i }).click(); // Adjust if needed
  await page.getByRole("link", { name: /MCU/i }).click();
  await expect(page).toHaveURL("/dashboard/mcus");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const originalName = `MCU-${Date.now()}`;
  const updatedName = `${originalName}-edited`;

  await test.step("Create MCU", async () => {
    await page.getByRole("button", { name: "Add MCU" }).click();
    await page.getByPlaceholder("Enter Mcu name").fill(originalName);

    await page.locator("button[role=combobox]", { hasText: /Select a region/i }).click();
    await page.getByRole("option").first().click();

    await page.getByRole("button", { name: /Create MCU/i }).click();

    await sleep(2000);
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }
    const newRow = page.locator("tbody tr", { hasText: originalName });
    await expect(newRow).toBeVisible();
  });

  await test.step("Edit MCU", async () => {
    const row = page.locator("tr", { hasText: originalName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const input = page.getByPlaceholder("Enter Mcu name");
    await input.fill(updatedName);

    await page.getByRole("button", { name: /update/i }).click();
    await sleep(1000);
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }

    const updatedRow = page.locator("tbody tr", { hasText: updatedName });
    await expect(updatedRow).toBeVisible();
  });

  await test.step("Delete MCU", async () => {
    const row = page.locator("tr", { hasText: updatedName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /delete/i }).click();

    const confirmButton = page.getByRole("button", { name: /delete/i });

    await confirmButton.click();
    await sleep(2000);

    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }

    await expect(page.locator("tbody tr", { hasText: updatedName })).toHaveCount(0);
  });
});





import { test, expect } from "@playwright/test";
import { sleep } from "../../../../utls";

test("Navigation on the Measurement Units page", async ({ page }) => {
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
  await page.getByRole("link", { name: /Measurement units/i }).click();

  await expect(page).toHaveURL("/dashboard/measurement-units");

  await page.getByText(/loading ...../i).waitFor({ state: "detached" });

  await expect(page.getByRole("heading", { name: "Measurement units" })).toBeVisible();
  await expect(page.getByText(/Here's a list of your Measurement units/i)).toBeVisible();

  // Select all table rows excluding the header
  const rows = await page.locator("tbody tr");

});




test("Create → Edit → Delete a Measurement Unit", async ({ page }) => {
  await page.goto("/sign-in");

  // Auth
  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  // Navigate to measurement units page
  await page.getByRole("button", { name: /Manage Crops/i }).click();
  await page.getByRole("link", { name: /Measurement units/i }).click();
  await expect(page).toHaveURL("/dashboard/measurement-units");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  // Unique 
  const originalName = `Unit-${Date.now()}`;
  const updatedName = `${originalName}-edited`;

  await test.step("Create measurement unit", async () => {
    await page.getByRole("button", { name: "Add Measurement Unit" }).click();
    await page.getByPlaceholder("Enter MeasurementUnit name").fill(originalName);

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /volume/i }).click();

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

  await test.step("Edit that unit", async () => {
    const row = page.locator("tr", { hasText: originalName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const input = page.getByPlaceholder("Enter MeasurementUnit name");
    await input.fill(updatedName);

    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /weight/i }).click();

    await page.getByRole("button", { name: /update/i }).click();

    await sleep(1000);
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }

    const updatedRow = page.locator("tbody tr", { hasText: updatedName });
    await expect(updatedRow).toContainText("WEIGHT");
  });

  await test.step("Delete that unit", async () => {
    const row = page.locator("tr", { hasText: updatedName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /delete/i }).click();

    // Confirm delete (if there's a confirmation step)
    const confirmButton = page.getByRole("button", { name: /confirm|delete/i });
    await confirmButton.click();

    await sleep(1000);
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }
    await expect(page.locator("tbody tr", { hasText: updatedName })).toHaveCount(0);
  });
});

import { test, expect } from "@playwright/test";
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
  await page.getByRole("link", { name: /Crops/i }).click();

  await expect(page).toHaveURL("/dashboard/crops");

  await page.getByText(/loading ...../i).waitFor({ state: "detached" });

  await expect(page.getByRole("heading", { name: "Crop" })).toBeVisible();
  await expect(page.getByText(/Here's a list of your Crop/i)).toBeVisible();

});

test("Create → Edit → Delete a Crop", async ({ page }) => {
  await page.goto("/sign-in", { timeout: 60000 });

  // Sign in
  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  // Navigate to Crops page
  await page.getByRole("button", { name: /Manage Crops/i }).click();
  await page.getByRole("link", { name: /Crops/i }).click();
  await expect(page).toHaveURL("/dashboard/crops");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const originalName = `Crop-${Date.now()}`;
  const updatedName = `${originalName}-edited`;

  await test.step("Create crop", async () => {
    await page.getByRole("button", { name: "Add Crop" }).click();

    await page.getByPlaceholder("Enter Crop name").fill(originalName);

    // Crop Type (1st combobox)
    await page.locator("button[role=combobox]", { hasText: /Select a crop type/i }).click();

    await page.getByRole("option").last().click();


    // Measurement Unit (2nd combobox)
    await page.locator("button[role=combobox]", { hasText: /Select a unit/i }).click();

    await page.getByRole("option").last().click();


    await page.locator("button[role=combobox]", { hasText: /False/i }).click();
    const moisture_content_computation = page.getByRole("option");
    if (await moisture_content_computation.count() === 0) throw new Error("No Packaging options available");
    await page.getByRole("option").last().click();


    await page.getByPlaceholder("Enter Max Moisture Content").fill('0', { force: true });

    // Packaging (3rd combobox)
    await page.locator("button[role=combobox]", { hasText: /Select a packaging/i }).click();
    const packagingOption = page.getByRole("option");
    if (await packagingOption.count() === 0) throw new Error("No Packaging options available");
    await page.getByRole("option").last().click();

    await page.getByRole("button", { name: /Create Crop/i }).click();

    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    const newRow = page.locator("tbody tr", { hasText: originalName });
    await expect(newRow).toBeVisible();
  });

  await test.step("Edit crop", async () => {
    const row = page.locator("tr", { hasText: originalName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const input = page.getByPlaceholder("Enter Crop name");
    await input.fill(updatedName);

    await page.getByRole("button", { name: /update/i }).click();
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    const updatedRow = page.locator("tbody tr", { hasText: updatedName });
    await expect(updatedRow).toBeVisible();
  });

  await test.step("Delete crop", async () => {
    const row = page.locator("tr", { hasText: updatedName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /Delete/i }).click();

    const confirmButton = page.getByRole("button", { name: /Delete/i });
    await confirmButton.click();

    await expect(page.locator("tbody tr", { hasText: updatedName })).toHaveCount(0);
  });
});

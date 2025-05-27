
import { test, expect } from "@playwright/test";
import { sleep } from "../../../../utls";

test("Create → Edit → Delete a Collection Center", async ({ page }) => {
  await page.goto("/sign-in", { timeout: 60000 });

  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await page.getByRole("button", { name: /Manage Amcos/i }).click(); // Adjust if Collection Center is in a separate menu
  await page.getByRole("link", { name: /Collection Center/i }).click();
  await expect(page).toHaveURL("/dashboard/collection-center");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const originalName = `CC-${Date.now()}`;
  const updatedName = `${originalName}-edited`;

  await test.step("Create Collection Center", async () => {
    await page.getByRole("button", { name: "Add Collection Center" }).click();
    await page.getByPlaceholder("Enter CollectionCenter name").fill(originalName);


    await sleep(1000);
    // Amcos dropdown
    await page.locator("button[role=combobox]", { hasText: /Select a Amcos/i }).click();
    const amcosOption = page.getByRole("option");
    if (await amcosOption.count() === 0) throw new Error("No Amcos options available");
    await amcosOption.last().click();

    // Village dropdown
    await page.locator("button[role=combobox]", { hasText: /Select a village/i }).click();
    const villageOption = page.getByRole("option");
    if (await villageOption.count() === 0) throw new Error("No Village options available");
    await villageOption.last().click();

    await page.getByRole("button", { name: /Create Collection Center/i }).click();
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }
    const newRow = page.locator("tbody tr", { hasText: originalName });
    await expect(newRow).toBeVisible();
  });

  await test.step("Edit Collection Center", async () => {
    const row = page.locator("tr", { hasText: originalName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const input = page.getByPlaceholder("Enter CollectionCenter name");
    await input.fill(updatedName);

    await page.getByRole("button", { name: /update/i }).click();
    await sleep(1000);
    const updatedRow = page.locator("tbody tr", { hasText: updatedName });
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }
    await expect(updatedRow).toBeVisible();
  });

  await test.step("Delete Collection Center", async () => {
    const row = page.locator("tr", { hasText: updatedName }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /delete/i }).click();

    const confirmButton = page.getByRole("button", { name: /delete/i });
    await confirmButton.click();

    await expect(page.locator("tbody tr", { hasText: updatedName })).toHaveCount(0);
  });
});

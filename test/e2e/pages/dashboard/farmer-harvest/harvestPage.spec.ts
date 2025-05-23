import { test, expect } from "@playwright/test";

test("Create → Edit → Delete a Farmer Harvest", async ({ page }) => {
  await page.goto("/sign-in");

  await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
  await page.getByLabel(/password/i).fill("shambabora");
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect(page).toHaveURL(/dashboard/i, { timeout: 6000 });
  await page.getByRole("link", { name: 'Farmers Harvests', exact: true }).click();
  await expect(page).toHaveURL("/dashboard/farmers-harvests");

  await page.getByText(/loading/i).waitFor({ state: "detached" });

  const uniqueSuffix = Date.now();
  const receiptNumber = `RCPT-${uniqueSuffix}`;
  const editedReceiptNumber = `${receiptNumber}-EDITED`;

  await test.step("Create Farmer Harvest", async () => {
    await page.getByRole("button", { name: /Add Harvest/i }).click();

    await page.getByRole("heading", { name: /Add Harvest/i }).waitFor({ state: "visible" });

    await page.waitForTimeout(340)


    await page.locator("button[role='combobox']", { hasText: /Select Farmer/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role='combobox']", { hasText: /Select Collected By/i }).click();
    await page.getByRole("option").first().click();


    await page.getByPlaceholder(/Enter Receipt Number/i).fill(receiptNumber);
    await page.getByPlaceholder(/Enter Tume Number/i).fill("TUME-123");

    await page.getByPlaceholder(/Enter Gross Weight/i).fill("120");
    await page.getByPlaceholder(/Enter Net Weight/i).fill("100");
    await page.getByPlaceholder(/Enter Packaging Weight/i).fill("20");
    await page.getByPlaceholder(/Enter Moisture Content/i).fill("10");


    await page.locator("button[role='combobox']", { hasText: /Select AMCOS/i }).click();
    await page.getByRole("option").first().click();

    await page.locator("button[role='combobox']", { hasText: /Select Crop/ }).click();
    await page.getByRole("option").first().click();



    await page.locator("button[role='combobox']", { hasText: /Select Collection Center/i }).click();
    await page.getByRole("option").first().click();

    // Bag Data
    await page.getByRole("button", { name: /Add Bag/i }).click();
    await page.getByPlaceholder(/Weight in KG/i).fill("60");
    await page.getByPlaceholder(/Grade/i).fill("A");

    await page.getByRole("button", { name: /Create Farmer Harvest/i }).click();
    // since new records go the end click last pasge if active
    const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

    // Check if the button is enabled before clicking
    if (!(await lastPageButton.isDisabled())) {
      await lastPageButton.click();
    }


    await expect(page.getByText(receiptNumber)).toBeVisible();
  });

  await test.step("Edit Farmer Harvest", async () => {
    const row = page.locator("tr", { hasText: receiptNumber }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /edit/i }).click();

    const receiptInput = page.getByPlaceholder(/Receipt Number/i);
    await receiptInput.fill(editedReceiptNumber);

    await page.getByRole("button", { name: /Update Farmer Harvest/i }).click();

    await expect(page.getByText(editedReceiptNumber)).toBeVisible();
  });

  await test.step("Delete Farmer Harvest", async () => {
    const row = page.locator("tr", { hasText: editedReceiptNumber }).first();
    const kebab = row.locator('button[aria-haspopup="menu"]');
    await kebab.click();

    await page.getByRole("menuitem", { name: /delete/i }).click();
    await page.getByRole("button", { name: /Delete/i }).click();

    await expect(page.getByText(editedReceiptNumber)).toHaveCount(0);
  });
});



import { test, expect } from "@playwright/test";

test.describe("Test Users Page ", () => {
  const email = `user${Date.now()}@example.com`;
  const password = "StrongPass123!";
  const firstName = "John";
  const lastName = "Doe";
  const phone = "0712345678";
  const role = "farmer";

  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByLabel(/email/i).fill("Kenny27@yahoo.com");
    await page.getByLabel(/password/i).fill("shambabora");
    const loginButton = page.getByRole("button", { name: /sign in|login/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
    }


    await expect(page).toHaveURL(/dashboard/i);
    await page.getByRole("link", { name: /Manage Users/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/users/i);
    await page.getByText(/loading/i).waitFor({ state: "detached" });
  });

  test("Create → Edit → Delete a User", async ({ page }) => {
    const updatedName = "Updated";
    const updatedPhone = "0788990011";

    await test.step("Create User", async () => {
      await page.getByRole("button", { name: /add user/i }).click();

      await page.getByPlaceholder("Enter email").fill(email);
      await page.getByPlaceholder("Enter password").fill(password);
      await page.getByPlaceholder("Enter First Name").fill(firstName);
      await page.getByPlaceholder("Enter Last Name").fill(lastName);
      await page.getByPlaceholder("Enter Phone Number").fill(phone);


      await page.getByRole("button", { name: /Create Farmer/i }).click();


      const lastPageButton = page.locator("button", { hasText: /Go to last page/i });

      // Check if the button is enabled before clicking
      if (!(await lastPageButton.isDisabled())) {
        await lastPageButton.click();
      }

      await expect(page.getByText(email)).toBeVisible();
    });

    await test.step("Edit User", async () => {
      const row = page.locator("tr", { hasText: email }).first();
      await row.locator('button[aria-haspopup="menu"]').click();
      await page.getByRole("menuitem", { name: /edit/i }).click();

      await page.getByPlaceholder("Enter First Name").fill(updatedName);
      await page.getByPlaceholder("Enter Phone Number").fill(updatedPhone);
      await page.getByRole("button", { name: /Udpate Farmer/i }).click();

      await expect(page.locator("tr", { hasText: updatedName })).toBeVisible();
    });

    await test.step("Delete User", async () => {
      const row = page.locator("tr", { hasText: updatedName }).first();
      await row.locator('button[aria-haspopup="menu"]').click();
      await page.getByRole("menuitem", { name: /delete/i }).click();
      await page.getByRole("button", { name: /delete/i }).click();

      await expect(page.locator("tr", { hasText: email })).toHaveCount(0);
    });
  });
});


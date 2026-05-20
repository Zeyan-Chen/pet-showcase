import { expect, test } from "@playwright/test";

test("admin can see the create product form", async ({ page }) => {
  await page.goto("http://localhost:3001/login");
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL ?? "");
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD ?? "");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/products/);
  await page.goto("http://localhost:3001/products/new");
  await expect(page.getByText("Create product")).toBeVisible();
});

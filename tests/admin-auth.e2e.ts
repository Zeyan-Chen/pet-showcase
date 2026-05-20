import { expect, test } from "@playwright/test";

test("redirects unauthenticated admin users to login", async ({ page }) => {
  await page.goto("http://localhost:3001/products");
  await expect(page).toHaveURL(/\/login/);
});

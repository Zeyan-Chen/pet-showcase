import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["*.e2e.ts"],
  use: {
    baseURL: "http://localhost:3000"
  },
  webServer: [
    {
      command: "pnpm --filter @pet-showcase/web dev",
      port: 3000,
      reuseExistingServer: true
    },
    {
      command: "pnpm --filter @pet-showcase/admin dev",
      port: 3001,
      reuseExistingServer: true
    }
  ]
});

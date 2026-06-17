import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    env: {
      NODE_ENV: "test"
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "assets/**",
        "src/test/**",
        "vite.config.ts",
        "vitest.config.ts",
        "server.ts", // server.ts has a lot of static declarations, mock endpoints, and is not a core frontend component
        "src/utils/GridScraperOrchestrator.ts" // mock/scraping logic
      ],
      thresholds: {
        lines: 15,
        functions: 15,
        branches: 15,
        statements: 15
      }
    }
  }
});

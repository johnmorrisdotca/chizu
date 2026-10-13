import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      { test: { name: "native", exclude: [...configDefaults.exclude, "src/docs-site.test.js"] } },
      // The shared size check bundles all 546 public entries, including 538 separate map/feature resources.
      // Keep the native tests' deadlines unchanged while allowing this larger documentation inventory to finish.
      { test: { name: "documentation", include: ["src/docs-site.test.js"], testTimeout: 15000 } },
    ],
  },
});

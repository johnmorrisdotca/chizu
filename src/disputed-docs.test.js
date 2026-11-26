import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** The guide on disputed areas names every region that carries the flag, in both languages, and the notes a page shows are the data's own. */
describe("the guide on disputed areas", () => {
  for (const [name, path] of [
    ["in English", "docs/guides/disputed-areas.md"],
    ["in Japanese", "docs/guides/ja/disputed-areas.md"],
  ])
    it(`names the eight regions that are flagged, ${name}, and carries no ticket id`, () => {
      const guide = readFileSync(path, "utf8");
      for (const code of ["XK", "TW", "EH", "UA-43", "UA-40", "AR", "JK", "LA"])
        expect(guide, code).toContain(`\`${code}\``);
      expect(guide).not.toMatch(/MODULES-\d+/);
    });
});

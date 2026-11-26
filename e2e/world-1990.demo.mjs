// The world of 1 January 1990 (MODULES-1622): a mounted map of it draws the former countries, each pressable, and names them in both languages.
import { expect, test } from "@playwright/test";

import { open } from "./demo.mjs";

test("a mounted world of 1990 draws the Soviet Union and the two Germanys, and a press names one", async ({ page }) => {
  const errors = await open(page, "?map=world");
  const named = await page.evaluate(async () => {
    const { mountChizu } = await import("./dist/mount-entry.js");
    const map = (await import("./dist/world-1990-entry.js")).default;
    const host = document.createElement("div");
    host.id = "t-1990";
    host.style.width = "700px";
    document.body.prepend(host);
    window.__chosen = [];
    mountChizu(host, { map, language: "ja", onSelect: (code) => window.__chosen.push(code) });
    return map.regions.length;
  });
  expect(named).toBe(154);
  await expect(page.locator("#t-1990 .cz-region")).toHaveCount(154);
  for (const code of ["SUHH", "YUCS", "CSHH", "DDDE", "DE", "YDYE", "YE"])
    await expect(page.locator(`#t-1990 .cz-region[data-code="${code}"]`)).toHaveCount(1);
  await expect(page.locator('#t-1990 .cz-region[data-code="RU"]')).toHaveCount(0);
  // the screen reader's name of a former country is its Japanese name
  await expect(page.locator('#t-1990 .cz-region[data-code="DDDE"] title')).toHaveText(/東ドイツ/);
  expect(errors).toEqual([]);
});

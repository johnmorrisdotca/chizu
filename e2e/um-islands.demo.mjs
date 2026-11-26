// The United States Minor Outlying Islands, each place in a box (MODULES-1677): the demo lists the map beside the country's own,
// and draws all nine places, which the country's own map cannot.
import { expect, test } from "@playwright/test";

import { at, open, press, region } from "./demo.mjs";

test("the map of the nine islands draws every one in a box, and a press on one chooses it", async ({
  page,
}, testInfo) => {
  const errors = await open(page, "?map=divisions:um-islands");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(9);
  for (const code of ["67", "71", "76", "79", "81", "84", "86", "89", "95"])
    await expect(region(page, code)).toHaveCount(1);
  await expect(page.locator(`${at("board")} .cz-inset`)).toHaveCount(9);
  await press(page, "71", testInfo);
  await expect(page.locator(at("info-name"))).toContainText("Midway");
  expect(errors).toEqual([]);
});

test("the picker lists the nine-island map beside the country's own", async ({ page }) => {
  await open(page, "?map=world");
  await expect(page.locator(`${at("map")} option[value="divisions:um-islands"]`)).toHaveCount(1);
  await expect(page.locator(`${at("map")} option[value="country:um"]`)).toHaveCount(1);
});

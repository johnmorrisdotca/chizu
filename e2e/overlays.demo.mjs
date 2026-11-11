// The overlays: the switch that draws the night side, a sample track in two tones and where it is now, from numbers
// the page works out; turning it on or off draws the overlays again, not the land.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, tap } from "./demo.mjs";

const overlays = (page, part) => page.locator(`${at("board")} .cz-overlays ${part}`);

test("the overlays switch draws the night side, a track split at the date line and a mark, and keeps the land as drawn", async ({
  page,
}, testInfo) => {
  const errors = await open(page, "?map=world");
  await expect(overlays(page, ".cz-overlay-line")).toHaveCount(0);
  // A mark on the land drawn now: a redrawn map would lose it.
  await page.evaluate(() => {
    document.querySelector('[data-testid="board"] .cz-land-copy').dataset.probe = "kept";
  });
  await tap(page, `${at("overlays")} button[data-value="true"]`, testInfo);
  await expect(overlays(page, '.cz-overlay-area[data-id="night"]').first()).toBeAttached();
  await expect(overlays(page, '.cz-overlay-line[data-id="past"]').first()).toBeAttached();
  await expect(overlays(page, '.cz-overlay-line[data-id="coming"]').first()).toBeAttached();
  await expect(overlays(page, '.cz-overlay-mark[data-id="now"] text').first()).toHaveText("Now");
  // The track goes round the world: split where it crosses the date line, it is more than one path.
  expect(await overlays(page, '.cz-overlay-line[data-id="coming"]').count()).toBeGreaterThan(3);
  expect(page.url()).toContain("overlays=on");
  await expect(page.locator(`${at("board")} .cz-land-copy[data-probe="kept"]`)).toHaveCount(1);
  await tap(page, `${at("overlays")} button[data-value="false"]`, testInfo);
  await expect(overlays(page, ".cz-overlay-line")).toHaveCount(0);
  await expect(page.locator(`${at("board")} .cz-land-copy[data-probe="kept"]`)).toHaveCount(1);
  expect(page.url()).not.toContain("overlays=");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("in Japanese the mark says いま, and the setting comes back from the address", async ({ page }) => {
  const errors = await open(page, "?map=world&overlays=on&lang=ja");
  await expect(overlays(page, '.cz-overlay-mark[data-id="now"] text').first()).toHaveText("いま");
  expect(errors).toEqual([]);
});

// The overlays: the switch that draws the night side, a sample track in two tones and where it is now, from numbers
// the page works out; turning it on or off draws the overlays again, not the land.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, serve, tap } from "./demo.mjs";

const overlays = (page, part) => page.locator(`${at("board")} .cz-overlays ${part}`);

test("the overlays switch draws the night side, a track unbroken across the date line and a mark, and keeps the land as drawn", async ({
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
  // The night side at the opacity asked (0.3), not the stylesheet's default.
  expect(
    await overlays(page, '.cz-overlay-area[data-id="night"]')
      .first()
      .evaluate((path) => getComputedStyle(path).fillOpacity),
  ).toBe("0.3");
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

test("a <chizu-map>'s overlays property draws only the overlays: the land, the zoom and the window stay", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.goto("http://chizu.test/embed/?region=world&zoom=3");
  const map = page.locator("chizu-map");
  await expect(map).toHaveAttribute("data-ready", "true");
  const zoomBefore = await map.locator(".czm-stage").getAttribute("data-zoom");
  await map.evaluate((element) => {
    element.shadowRoot.querySelector(".cz-land-copy").dataset.probe = "kept";
    element.overlays = [{ kind: "mark", at: [35.68, 139.69], label: "Tokyo", id: "here" }];
  });
  await expect(map.locator('.cz-overlays .cz-overlay-mark[data-id="here"]').first()).toBeAttached();
  await expect(map.locator('.cz-land-copy[data-probe="kept"]')).toHaveCount(1);
  await map.evaluate((element) => {
    element.overlays = [{ kind: "mark", at: [51.5, -0.12], id: "there" }];
  });
  await expect(map.locator('.cz-overlay-mark[data-id="there"]').first()).toBeAttached();
  await expect(map.locator('.cz-overlay-mark[data-id="here"]')).toHaveCount(0);
  await expect(map.locator('.cz-land-copy[data-probe="kept"]')).toHaveCount(1);
  expect(await map.locator(".czm-stage").getAttribute("data-zoom")).toBe(zoomBefore);
  expect(await map.evaluate((element) => element.options.overlays?.length)).toBe(1);
  expect(errors).toEqual([]);
});

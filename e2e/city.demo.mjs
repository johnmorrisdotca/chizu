// The city scale: a made-up ground drawn past the 10x step, from GeoJSON and a picture in metres, at four scales.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open } from "./demo.mjs";

const board = `${at("city-board")} svg.chizu`;
const scale = (page, value) => page.locator(`${at("city-scale")} button[data-value="${value}"]`);

test("it opens on Japan's map at 10x with the next step marked, and says how much ground that is", async ({ page }) => {
  const errors = await open(page, "?map=world");
  await expect(page.locator(`${board} .city-footprint`)).toHaveCount(1);
  await expect(page.locator(board)).toHaveAttribute("data-map", "country-jp");
  await expect(page.locator(at("city-status"))).toHaveText(/^About [\d.]+ km across; one unit of the drawing is [\d.]+ km\.$/);
  expect(errors).toEqual([]);
});

test("each step is a local map of the same ground, true to its metres, with a scale bar and a credit line", async ({ page }) => {
  const errors = await open(page, "?map=world");
  for (const [value, metres, bar, perUnit] of [["20000", 20000, "2 km", 20], ["2000", 2000, "200 m", 2], ["400", 400, "50 m", 0.4]]) {
    await scale(page, value).click();
    const drawing = page.locator(board);
    await expect(drawing).toHaveAttribute("data-map", "local");
    await expect(drawing).toHaveAttribute("data-metres-per-unit", String(perUnit));
    await expect(drawing).toHaveAttribute("viewBox", "0 0 1000 1000");
    await expect(drawing).toHaveAttribute("aria-label", metres >= 1000 ? `Map of the area, ${metres / 1000} km across` : `Map of the area, ${metres} m across`);
    await expect(page.locator(`${board} .cz-scale-text`)).toHaveText(bar);
    await expect(page.locator(`${board} .cz-credit`)).toHaveText("Made-up shapes for this demo");
    await expect(page.locator(at("city-status"))).toContainText(`one unit of the drawing is`);
  }
  expect(errors).toEqual([]);
});

test("at 400 m the shapes are drawn in their kinds' looks, the pitch is a picture turned to its bearing, and the bearing can be changed", async ({ page }) => {
  await open(page, "?map=world&city=400");
  await expect(page.locator(`${board} [data-type="water"] .cz-local-area`)).toHaveCount(1);
  await expect(page.locator(`${board} [data-type="building"].stand`)).toHaveCount(1);
  await expect(page.locator(`${board} [data-type="road"] .cz-local-line`)).toHaveCount(2);
  await expect(page.locator(`${board} .cz-marker[data-code="pitch"]`)).toHaveAttribute("data-bearing", "30");
  const before = await page.locator(`${board} .cz-marker`).getAttribute("transform");
  await page.locator(at("city-bearing")).fill("90");
  await expect(page.locator(`${board} .cz-marker`)).toHaveAttribute("data-bearing", "90");
  expect(await page.locator(`${board} .cz-marker`).getAttribute("transform")).not.toBe(before);
  await expect(page.locator(at("city-bearing-out"))).toHaveText("90°");
  // The picture is 60 m across and the canvas is 0.4 m to the unit: 150 units wide on the screen.
  const width = await page.locator(`${board} .cz-marker rect`).first().evaluate((node) => node.getBoundingClientRect().width / node.ownerSVGElement.getBoundingClientRect().width);
  expect(width).toBeGreaterThan(0.05);
});

test("names and numbers: the names print where they fit, and the callout placer numbers four things in open ground", async ({ page }) => {
  await open(page, "?map=world&city=400");
  await expect(page.locator(`${board} .cz-label`)).toHaveCount(0);
  await page.locator(`${at("city-names")} button[data-value="true"]`).click();
  await expect(page.locator(`${board} .cz-label`).filter({ hasText: "Main hall" })).toHaveCount(1);
  await page.locator(`${at("city-numbers")} button[data-value="true"]`).click();
  await expect(page.locator(`${board} .cz-callout`)).toHaveCount(4);
  await expect(page.locator(`${board} .cz-callout[data-code="hall"] title`)).toHaveText("Number 1: Main hall");
});

test("in Japanese the names, the label and the credit follow", async ({ page }) => {
  await open(page, "?map=world&city=400&cityNames=on");
  await page.locator('[data-lang="ja"]').click();
  await expect(page.locator(`${board} .cz-label`).filter({ hasText: "本館" })).toHaveCount(1);
  await expect(page.locator(board)).toHaveAttribute("aria-label", "周辺の地図、幅400 m");
  await expect(page.locator("#city-title")).toHaveText("街の縮尺");
});

test("it fits the page and keeps clear of the sides", async ({ page }) => {
  await open(page, "?map=world&city=400&cityNames=on&cityNumbers=on");
  await page.locator(at("city")).scrollIntoViewIfNeeded();
  await noSidewaysScroll(page);
});

// Exploring the map: pressing a place, the names in both languages, the choice of map, zoom, drag and the world's seam.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, region, svg, tap } from "./demo.mjs";

const viewBox = (page) => svg(page).getAttribute("viewBox").then((text) => text.split(" ").map(Number));

test("the world is drawn with every country when asked for, and nothing is chosen at first", async ({ page }) => {
  const errors = await open(page, "?map=world");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(173);
  await expect(svg(page)).toHaveAttribute("aria-label", "Map of World");
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Nothing chosen");
  await expect(page.locator(at("info"))).toContainText("Press a place");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("pressing a country chooses it, zooms to it and says its name in both languages", async ({ page }, testInfo) => {
  await open(page, "?map=world");
  await tap(page, region(page, "AU"), testInfo);
  await expect(page.locator(at("info-name"))).toHaveText("Australia · オーストラリア");
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Australia chosen");
  await expect(region(page, "AU")).toHaveClass(/cz-tone-selected/);
  await expect(page.locator(`${at("board")} .czm-stage`)).not.toHaveAttribute("data-zoom", "1");
  // Australia touches nothing on this map; Brazil's neighbours are buttons, and pressing one chooses it.
  await expect(page.locator(at("info"))).toContainText("Touches no other place");
  await page.locator("#names tbody tr[data-code='BR']").click();
  await expect(page.locator(at("info-name"))).toHaveText("Brazil · ブラジル");
  await expect(region(page, "AU")).not.toHaveClass(/cz-tone-selected/);
  await page.locator(`${at("info")} button[data-code="AR"]`).click();
  await expect(page.locator(at("info-name"))).toHaveText("Argentina · アルゼンチン");
  // The centre of a country on the world is given as a longitude and latitude, from the map's own projection.
  await expect(page.locator(at("info"))).toContainText("Centre at");
});

test("in Japanese the names read Japanese first, with the reading", async ({ page }, testInfo) => {
  await open(page, "?lang=ja&map=world");
  await expect(svg(page)).toHaveAttribute("aria-label", "世界の地図");
  await tap(page, region(page, "AU"), testInfo);
  await expect(page.locator(at("info-name"))).toHaveText("オーストラリア · Australia");
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("オーストラリアを選びました");
  await open(page, "?lang=ja&map=divisions:us");
  await expect(page.locator("#names tbody tr[data-code='CA'] td").nth(3)).toHaveText("カリフォルニア州");
});

test("the table of names lists every place in both languages, narrows as you type and chooses on a press", async ({ page }) => {
  await open(page, "?map=world");
  const rows = page.locator("#names tbody tr");
  await expect(rows).toHaveCount(173);
  await expect(page.locator("#names tbody tr[data-code='US'] td").nth(3)).toHaveText("アメリカ（アメリカ合衆国）");
  await page.locator(at("filter")).fill("korea");
  await expect(rows).toHaveCount(2);
  await page.locator(at("filter")).fill("日本");
  await expect(rows).toHaveCount(1);
  await rows.first().click();
  await expect(page.locator(at("info-name"))).toHaveText("Japan · 日本");
  await expect(page.locator(at("info-reading"))).toHaveText("にほん");
  await expect(rows.first()).toHaveAttribute("aria-selected", "true");
});

test("the map chooser offers Japan first, the world, its continents, 31 other countries' regions and every country alone", async ({ page }) => {
  await open(page, "?map=world");
  const groups = page.locator("#map optgroup");
  await expect(groups).toHaveCount(5);
  await expect(groups.nth(0).locator("option")).toHaveCount(1);
  await expect(groups.nth(0).locator("option")).toHaveAttribute("value", "divisions:jp");
  await expect(groups.nth(2).locator("option")).toHaveCount(6);
  await expect(groups.nth(3).locator("option")).toHaveCount(31);
  await expect(groups.nth(4).locator("option")).toHaveCount(238);
  await page.locator(at("map")).selectOption("divisions:de");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(16);
  await expect(svg(page)).toHaveAttribute("data-map", "divisions-de");
  await expect(page.locator("#names tbody tr")).toHaveCount(16);
  await page.locator(at("map")).selectOption("country:jp");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(1);
  await expect(svg(page)).toHaveAttribute("data-map", "country-jp");
  await expect(page).toHaveURL(/map=country%3Ajp/);
  // The address picks the map too.
  await open(page, "?map=divisions:fr");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(96);
});

test("the buttons zoom in ten steps and the whole-map button comes back", async ({ page }) => {
  await open(page, "?map=divisions:us");
  const stage = page.locator(`${at("board")} .czm-stage`);
  const zoomIn = page.locator(`${at("board")} [data-action="zoom-in"]`);
  const zoomOut = page.locator(`${at("board")} [data-action="zoom-out"]`);
  const whole = page.locator(`${at("board")} [data-action="zoom-whole"]`);
  await expect(zoomOut).toBeDisabled();
  for (const level of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    await zoomIn.click();
    await expect(stage).toHaveAttribute("data-zoom", String(level));
  }
  await expect(zoomIn).toBeDisabled();
  const [, , width10] = await viewBox(page);
  expect(width10).toBeCloseTo(1000 / 10, 1);
  // The coastline's line is as thin at 10× as at 1×: its width does not grow with the zoom.
  const stroke = await page.locator(`${at("board")} .cz-land`).first().evaluate((node) => getComputedStyle(node).vectorEffect);
  expect(stroke).toBe("non-scaling-stroke");
  await zoomOut.click();
  await expect(stage).toHaveAttribute("data-zoom", "9");
  await whole.click();
  await expect(stage).toHaveAttribute("data-zoom", "1");
  expect(await viewBox(page)).toEqual([0, 0, 1000, 740]);
});

test("dragging moves the window and keeps it on a country's map, and the keyboard moves and zooms it too", async ({ page }) => {
  await open(page, "?map=divisions:us");
  const stage = page.locator(`${at("board")} .czm-stage`);
  await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  const [x0, y0] = await viewBox(page);
  const box = await stage.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 60, { steps: 6 });
  await page.mouse.up();
  const [x1, y1] = await viewBox(page);
  expect(x1).toBeLessThan(x0);
  expect(y1).toBeLessThan(y0);
  // Dragged far past the edge it stops at the edge.
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 20, box.y + box.height - 20, { steps: 12 });
  await page.mouse.up();
  const [x2, y2] = await viewBox(page);
  expect(x2).toBeGreaterThanOrEqual(0);
  expect(y2).toBeGreaterThanOrEqual(0);
  // Keys: an arrow moves, plus and minus zoom, zero shows it all.
  await stage.focus();
  await page.keyboard.press("ArrowRight");
  expect((await viewBox(page))[0]).toBeGreaterThan(x2);
  await page.keyboard.press("-");
  await expect(stage).toHaveAttribute("data-zoom", "2");
  await page.keyboard.press("0");
  await expect(stage).toHaveAttribute("data-zoom", "1");
});

test("a drag is not a press: nothing is chosen by moving the map", async ({ page }) => {
  await open(page, "?map=divisions:us");
  const stage = page.locator(`${at("board")} .czm-stage`);
  await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  const box = await stage.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Nothing chosen");
});

test("the world goes round: dragged past its edge it draws the land again on the far side, and is never stopped east or west", async ({ page }) => {
  await open(page, "?map=world");
  const stage = page.locator(`${at("board")} .czm-stage`);
  await expect(page.locator(`${at("board")} .cz-land-copy`)).toHaveCount(1);
  const box = await stage.boundingBox();
  // Whole-world view: drag a quarter of the way across to the left, so the window moves east and overhangs the seam.
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  const [x, , width] = await viewBox(page);
  expect(width).toBe(1000);
  expect(x).toBeGreaterThan(100);
  await expect(page.locator(`${at("board")} .cz-land-copy`)).toHaveCount(2);
  await expect(page.locator(`${at("board")} .cz-land-copy`).nth(1)).toHaveAttribute("transform", "translate(1000 0)");
  // Every country is drawn twice, so a country is pressable on either side of the seam.
  await expect(page.locator(`${at("board")} .cz-region[data-code="FR"]`)).toHaveCount(2);
  // The same from the other direction, and still no edge.
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2, { steps: 12 });
  await page.mouse.up();
  expect((await viewBox(page))[0]).toBeLessThan(x);
  // The whole-map button brings the world back to its own middle.
  await page.locator(`${at("board")} [data-action="zoom-whole"]`).click();
  expect(await viewBox(page)).toEqual([0, 0, 1000, 489]);
  await expect(page.locator(`${at("board")} .cz-land-copy`)).toHaveCount(1);
});

test("Ctrl and the wheel zoom the map, and the wheel alone leaves the page to scroll", async ({ page }) => {
  await open(page, "?map=world");
  const stage = page.locator(`${at("board")} .czm-stage`);
  const box = await stage.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, -200);
  await expect(stage).toHaveAttribute("data-zoom", "1");
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -200);
  await page.keyboard.up("Control");
  await expect(stage).toHaveAttribute("data-zoom", "2");
});

test("zoomed in on the world, the coasts are drawn from the finer outlines, fetched only then", async ({ page }) => {
  const fetched = [];
  page.on("request", (request) => request.url().includes("world-detail") && fetched.push(request.url()));
  await open(page, "?map=world");
  const stage = page.locator(`${at("board")} .czm-stage`);
  await expect(stage).toHaveAttribute("data-detail", "false");
  expect(fetched).toEqual([]);
  for (let step = 0; step < 3; step += 1) await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  await expect(stage).toHaveAttribute("data-zoom", "4");
  await expect(stage).toHaveAttribute("data-detail", "true");
  expect(fetched).toHaveLength(1);
  const finer = await region(page, "JP").locator(".cz-land").first().getAttribute("d");
  await page.locator(`${at("board")} [data-action="zoom-out"]`).click();
  await expect(stage).toHaveAttribute("data-detail", "false");
  const coarse = await region(page, "JP").locator(".cz-land").first().getAttribute("d");
  expect(finer.length).toBeGreaterThan(coarse.length * 3);
});

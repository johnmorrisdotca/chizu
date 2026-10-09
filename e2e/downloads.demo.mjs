// What the demo hands over: the map as you see it, the list of places, and a numbered sheet to print.
import { expect, test } from "@playwright/test";

import { at, open } from "./demo.mjs";

const take = async (page, testid) => {
  const waiting = page.waitForEvent("download");
  await page.locator(at(testid)).click();
  const file = await waiting;
  return { name: file.suggestedFilename(), body: Buffer.concat(await (await file.createReadStream()).toArray()) };
};

test("the map downloads as an SVG that stands alone and a PNG, and the places as CSV, JSON and text", async ({ page }) => {
  await open(page);
  const svg = await take(page, "download-map-svg");
  expect(svg.name).toBe("chizu-divisions-jp-map.svg");
  const text = svg.body.toString("utf8");
  expect(text.startsWith('<svg width="1200"')).toBe(true);
  expect(text).toContain("<style>");
  expect(text).toContain('data-theme="light"');
  expect(text).toContain("<title>Tokyo</title>");
  const png = await take(page, "download-map-png");
  expect(png.body.subarray(1, 4).toString("ascii")).toBe("PNG");
  const csv = (await take(page, "download-list-csv")).body.toString("utf8").trim().split("\n");
  expect(csv[0]).toBe("code,iso,name,nameJa,reading,group,groupJa");
  expect(csv).toHaveLength(48);
  expect(csv).toContain("13,JP-13,Tokyo,東京都,とうきょうと,Kanto,関東地方");
  const json = JSON.parse((await take(page, "download-list-json")).body.toString("utf8"));
  expect(json.map).toBe("divisions-jp");
  expect(json.rows[0]).toEqual({ code: "1", iso: "JP-01", name: "Hokkaidō", nameJa: "北海道", reading: "ほっかいどう", group: "Hokkaido", groupJa: "北海道地方" });
  const txt = (await take(page, "download-list-txt")).body.toString("utf8");
  expect(txt.split("\n")[0]).toBe("Japan");
});

test("a part's list holds only the part", async ({ page }) => {
  await open(page, "?part=Shikoku");
  const csv = (await take(page, "download-list-csv")).body.toString("utf8").trim().split("\n");
  expect(csv).toHaveLength(5);
  expect((await take(page, "download-list-csv")).name).toBe("chizu-divisions-jp-shikoku-places.csv");
});

test("callouts download as a sheet to print, the map and its numbered list as one SVG, and the list as CSV, JSON and text", async ({ page }) => {
  await open(page, "?mode=callouts&part=Kyushu");
  const sheet = (await take(page, "download-sheet-svg")).body.toString("utf8");
  expect(sheet.match(/class="cz-callout"/g)).toHaveLength(8);
  expect(sheet).toContain("Okinawa");
  expect(sheet).toContain('<tspan font-weight="700">8</tspan>');
  const png = await take(page, "download-sheet-png");
  expect(png.body.subarray(1, 4).toString("ascii")).toBe("PNG");
  const csv = (await take(page, "download-legend-csv")).body.toString("utf8").trim().split("\n");
  expect(csv[0]).toBe("number,code,iso,name,nameJa,reading");
  expect(csv).toHaveLength(9);
  const json = JSON.parse((await take(page, "download-legend-json")).body.toString("utf8"));
  expect(json.rows.map((row) => row.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect((await take(page, "download-legend-txt")).body.toString("utf8")).toContain("Kagoshima");
});

// Japan first: the 47 prefectures are the map the demo opens on, with Okinawa and the outlying islands in boxes, every
// prefecture named, read and coded, and the eight regions a Japanese school teaches as parts to look at.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, press, region, svg } from "./demo.mjs";

test("the demo opens on Japan's 47 prefectures, with Okinawa and the far islands in dashed boxes", async ({ page }) => {
  const errors = await open(page);
  await expect(svg(page)).toHaveAttribute("data-map", "divisions-jp");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(47);
  await expect(page.locator(`${at("board")} .cz-inset`)).toHaveCount(3);
  await expect(page.locator("#names tbody tr")).toHaveCount(47);
  await expect(page.locator(at("map"))).toHaveValue("divisions:jp");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("a prefecture is named in both languages, read in kana, and given its ISO code and region", async ({ page }) => {
  await open(page, "?select=13");
  await expect(page.locator(at("info-name"))).toHaveText("Tokyo · 東京都");
  await expect(page.locator(at("info-reading"))).toHaveText("とうきょうと");
  await expect(page.locator(at("info-iso"))).toHaveText("ISO 3166-2: JP-13");
  await expect(page.locator(at("info-group"))).toHaveText("Part: Kanto");
  await expect(page.locator(`${at("info")} button[data-code="11"]`)).toHaveText("Saitama");
  await open(page, "?select=47&lang=ja");
  await expect(page.locator(at("info-name"))).toHaveText("沖縄県 · Okinawa");
  await expect(page.locator(at("info-group"))).toHaveText("地方: 九州地方");
  await expect(page.locator(at("info"))).toContainText("となりあう場所がありません");
});

test("Okinawa is pressed where it is drawn, in its box", async ({ page }, testInfo) => {
  await open(page);
  await press(page, "47", testInfo);
  await expect(page.locator(at("info-name"))).toHaveText("Okinawa · 沖縄県");
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Okinawa chosen");
});

test("the table finds a prefecture by its name, its reading in either kana, or its ISO code", async ({ page }) => {
  await open(page);
  const rows = page.locator("#names tbody tr");
  for (const [typed, code] of [["osaka", "27"], ["おおさか", "27"], ["オオサカ", "27"], ["JP-27", "27"], ["大阪", "27"]]) {
    await page.locator(at("filter")).fill(typed);
    await expect(rows.first(), typed).toHaveAttribute("data-code", code);
  }
});

test("a part of Japan is one of its eight regions: the map frames it and fades the rest, and the list keeps to it", async ({ page }) => {
  await open(page);
  const options = await page.locator(`${at("part")} option`).allTextContents();
  expect(options).toEqual(["All of it", "Hokkaido (1)", "Tohoku (6)", "Kanto (7)", "Chubu (9)", "Kinki (7)", "Chugoku (5)", "Shikoku (4)", "Kyushu (8)"]);
  await page.locator(at("part")).selectOption("Kanto");
  await expect(page.locator("#names tbody tr")).toHaveCount(7);
  await expect(region(page, "13")).not.toHaveClass(/cz-tone-faint/);
  await expect(region(page, "27")).toHaveClass(/cz-tone-faint/);
  await expect(page.locator(`${at("board")} .czm-stage`)).not.toHaveAttribute("data-zoom", "1");
  await expect(page).toHaveURL(/part=Kanto/);
  // A quiz of the part asks only about it.
  await page.locator(`${at("modes")} button[data-value="quiz"]`).click();
  for (const code of await page.locator(`${at("choices")} button`).evaluateAll((all) => all.map((button) => button.dataset.code))) expect(["8", "9", "10", "11", "12", "13", "14"]).toContain(code);
});

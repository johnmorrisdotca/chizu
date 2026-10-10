// The seas, lakes, rivers and mountains: the switch that draws them, the search that finds them, the card for one,
// the water quiz, and their downloads, in both languages and at a phone's width.
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, svg, tap } from "./demo.mjs";

const feature = (page, code) => page.locator(`${at("board")} .cz-feature[data-code="${code}"]`).first();

/** A point on the screen that is this feature's when pressed: a grid over its shape, the first point it answers at. */
async function pointOnFeature(page, code) {
  return page.evaluate((wanted) => {
    const group = document.querySelector(`[data-testid="board"] .cz-feature[data-code="${wanted}"]`);
    if (!group) return null;
    const stage = document.querySelector('[data-testid="board"] .czm-stage').getBoundingClientRect();
    const hits = (x, y) => document.elementFromPoint(x, y)?.closest(".cz-feature")?.dataset.code === wanted;
    let best = null;
    for (const path of group.querySelectorAll("path")) {
      const box = path.getBoundingClientRect();
      const candidates = [];
      for (let i = 1; i < 30; i += 1) for (let j = 1; j < 30; j += 1) candidates.push([box.left + (box.width * i) / 30, box.top + (box.height * j) / 30]);
      // A river is a line: points along it, too, since a grid over its box may never land on it.
      const length = path.getTotalLength();
      const ctm = path.getScreenCTM();
      for (let k = 1; k < 200; k += 1) {
        const at = path.getPointAtLength((length * k) / 200);
        const screen = new window.DOMPoint(at.x, at.y).matrixTransform(ctm);
        candidates.push([screen.x, screen.y]);
      }
      for (const [x, y] of candidates) {
        {
          // Inside the map, on the screen, and clear of the zoom buttons in its bottom-right corner.
          if (x < stage.left + 4 || x > stage.right - 4 || y < stage.top + 4 || y > Math.min(stage.bottom, window.innerHeight) - 4 || (x > stage.right - 64 && y > stage.bottom - 180)) continue;
          if (!hits(x, y)) continue;
          // The point with the most of the feature round it, so a finger's tap lands on it too.
          let room = 0;
          while (room < 12 && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => hits(x + dx * (room + 1), y + dy * (room + 1)))) room += 1;
          if (best === null || room > best.room) best = { x, y, room };
        }
      }
    }
    return best;
  }, code);
}

async function press(page, code, testInfo) {
  await page.locator(`${at("board")} .czm-stage`).scrollIntoViewIfNeeded();
  const point = await pointOnFeature(page, code);
  expect(point, `a point on ${code}`).not.toBeNull();
  // A river a few pixels wide is pressed with the mouse: WebKit moves a finger's tap to the nearest thing it thinks is meant.
  const line = (await feature(page, code).getAttribute("data-group")) === "rivers";
  if (testInfo.project.use.hasTouch === true && !line) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

test("the map draws no features until they are turned on, then the water, then everything, and remembers the choice", async ({ page }, testInfo) => {
  const errors = await open(page, "?map=divisions:jp");
  await expect(page.locator(`${at("board")} .cz-feature`)).toHaveCount(0);
  await tap(page, `${at("features")} button[data-value="water"]`, testInfo);
  await expect(feature(page, "Q27092")).toHaveAttribute("data-kind", "sea");
  await expect(feature(page, "Q200239")).toHaveAttribute("data-kind", "lake");
  await expect(page.locator(`${at("board")} .cz-feature[data-group="rivers"]`)).toHaveCount(3);
  await expect(page.locator(`${at("board")} .cz-feature[data-group="peaks"]`)).toHaveCount(0);
  await expect(page.locator(`${at("board")} .cz-water-label`).first()).toBeVisible();
  expect(page.url()).toContain("features=water");
  await tap(page, `${at("features")} button[data-value="all"]`, testInfo);
  await expect(feature(page, "Q39231")).toHaveAttribute("data-kind", "peak");
  await tap(page, `${at("features")} button[data-value="off"]`, testInfo);
  await expect(page.locator(`${at("board")} .cz-feature`)).toHaveCount(0);
  expect(page.url()).not.toContain("features=");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("a search finds water by English, Japanese or kana, and choosing it frames it and fills the card, which keeps its height", async ({ page }, testInfo) => {
  await open(page, "?map=divisions:jp");
  const box = page.locator(".feature-box");
  const card = page.locator(at("info"));
  const [boxHeight, cardHeight] = [await box.evaluate((node) => node.offsetHeight), await card.evaluate((node) => node.offsetHeight)];
  const rows = page.locator("#feature-list tbody tr");
  await expect(page.locator(at("feature-count"))).toContainText("named on this map");
  for (const typed of ["biwa", "琵琶", "びわ"]) {
    await page.locator(at("feature-find")).fill(typed);
    await expect(rows.first()).toHaveAttribute("data-code", "Q200239");
  }
  expect(await box.evaluate((node) => node.offsetHeight)).toBe(boxHeight);
  await tap(page, rows.first(), testInfo);
  await expect(page.locator(at("info-name"))).toHaveText("Lake Biwa · 琵琶湖");
  await expect(page.locator(at("info-kind"))).toHaveText("Lake");
  await expect(page.locator(at("info-reading"))).toHaveText("びわこ");
  // Its group is off, but a chosen feature is drawn, lit, and the map zooms to it.
  await expect(feature(page, "Q200239")).toHaveAttribute("data-tone", "selected");
  await expect(page.locator(`${at("board")} .czm-stage`)).not.toHaveAttribute("data-zoom", "1");
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Lake Biwa chosen");
  expect(await card.evaluate((node) => node.offsetHeight)).toBe(cardHeight);
  await noSidewaysScroll(page);
});

test("with the water on, pressing a sea chooses it, and its card offers the seas it touches", async ({ page }, testInfo) => {
  await open(page, "?map=divisions:jp&features=water");
  await press(page, "Q41602", testInfo);
  await expect(page.locator(at("info-name"))).toHaveText("Sea of Okhotsk · オホーツク海");
  await expect(page.locator(at("info-kind"))).toHaveText("Sea");
  await expect(page.locator(`${at("info")} button[data-code="Q98"]`)).toBeVisible();
  await page.locator(`${at("info")} button[data-code="Q98"]`).click();
  await expect(page.locator(at("info-name"))).toHaveText("Pacific Ocean · 太平洋");
});

test("in Japanese the features are named and read in Japanese", async ({ page }) => {
  await open(page, "?lang=ja&map=divisions:jp&features=water");
  await expect(page.locator(`${at("board")} .cz-water-label[data-code="Q27092"]`)).toHaveText("日本海");
  await expect(page.locator(`${at("features")} button[data-value="water"]`)).toHaveText("海と川");
  await page.locator(at("feature-find")).fill("せとない");
  await page.locator("#feature-list tbody tr").first().click();
  await expect(page.locator(at("info-name"))).toHaveText("瀬戸内海 · Seto Inland Sea");
  await expect(page.locator(at("info-kind"))).toHaveText("海");
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("瀬戸内海を選びました");
});

test("the water quiz names a sea, a lake or a river, draws the water with no names on it, and a press answers", async ({ page }, testInfo) => {
  // A round whose first question is a sea, which a finger can press on a phone's whole world.
  let errors = [];
  let code = null;
  for (let seed = 1; seed <= 20 && code === null; seed += 1) {
    errors = await open(page, `?map=world&mode=quiz&style=water&seed=${seed}`);
    await expect(page.locator(at("question"))).toContainText("Press it on the map");
    const name = /^Where is (.+) \(/.exec(await page.locator(at("question")).textContent())[1];
    const asked = await page.locator(`${at("board")} .cz-feature`).evaluateAll((groups, wanted) => groups.find((group) => group.querySelector("title")?.textContent === wanted), name);
    expect(asked, name).not.toBeUndefined();
    const found = await page.locator(`${at("board")} .cz-feature`).evaluateAll((groups, wanted) => groups.find((group) => group.querySelector("title")?.textContent === wanted)?.dataset, name);
    if (found.group === "marine") code = found.code;
  }
  expect(code).not.toBeNull();
  await expect(page.locator(`${at("board")} .cz-feature-label`)).toHaveCount(0);
  await press(page, code, testInfo);
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await expect(feature(page, code)).toHaveAttribute("data-tone", "correct");
  // Back in Explore, the switch's choice (off) holds again.
  await tap(page, `${at("modes")} button[data-value="explore"]`, testInfo);
  await expect(page.locator(`${at("board")} .cz-feature`)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the features of the map download as CSV, JSON and text", async ({ page }) => {
  await open(page, "?map=divisions:jp");
  const [csv] = await Promise.all([page.waitForEvent("download"), page.locator(at("download-features-csv")).click()]);
  expect(csv.suggestedFilename()).toBe("chizu-divisions-jp-features.csv");
  const text = readFileSync(await csv.path(), "utf8");
  expect(text.split("\n")[0]).toContain("code,kind,group,name,nameJa,reading,rank,elevation");
  expect(text).toContain("Q200239,lake,lakes,Lake Biwa,琵琶湖,びわこ");
  const [json] = await Promise.all([page.waitForEvent("download"), page.locator(at("download-features-json")).click()]);
  expect(JSON.parse(readFileSync(await json.path(), "utf8")).rows.some((row) => row.code === "Q231312")).toBe(true);
  const [txt] = await Promise.all([page.waitForEvent("download"), page.locator(at("download-features-txt")).click()]);
  expect(readFileSync(await txt.path(), "utf8")).toContain("Seto Inland Sea");
});

test("the world's water is drawn at every zoom with lines the same width on the screen", async ({ page }, testInfo) => {
  await open(page, "?map=world&features=water");
  await expect(svg(page)).toBeVisible();
  const width = () => page.locator(`${at("board")} .cz-river`).first().evaluate((node) => getComputedStyle(node).vectorEffect);
  expect(await width()).toBe("non-scaling-stroke");
  await tap(page, `${at("board")} .czm-button[data-action="zoom-in"]`, testInfo);
  await expect(page.locator(`${at("board")} .czm-stage`)).toHaveAttribute("data-zoom", "2");
  await expect(page.locator(`${at("board")} .cz-feature[data-group="rivers"]`).first()).toBeAttached();
  await noSidewaysScroll(page);
});

test("the capitals switch marks a country's capital and its regions' seats, and Naha is drawn in Okinawa's box", async ({ page }, testInfo) => {
  await open(page, "?map=divisions:jp");
  await tap(page, `${at("features")} button[data-value="capitals"]`, testInfo);
  await expect(feature(page, "capital-JP")).toHaveAttribute("data-kind", "capital");
  await expect(page.locator(`${at("board")} .cz-feature[data-kind="seat"]`)).toHaveCount(46);
  await expect(page.locator(`${at("board")} .cz-feature[data-group="marine"]`)).toHaveCount(0);
  const [naha, box] = await Promise.all([feature(page, "seat-JP-47").boundingBox(), page.locator(`${at("board")} .cz-inset[data-code="47"]`).first().boundingBox()]);
  expect(naha.x >= box.x && naha.x + naha.width <= box.x + box.width && naha.y >= box.y && naha.y + naha.height <= box.y + box.height).toBe(true);
});

test("the capitals switch draws Juneau and Honolulu inside Alaska's and Hawaii's boxes on the United States map", async ({ page }, testInfo) => {
  await open(page, "?map=divisions:us");
  await tap(page, `${at("features")} button[data-value="capitals"]`, testInfo);
  await expect(page.locator(`${at("board")} .cz-feature[data-kind="seat"]`)).toHaveCount(50);
  for (const code of ["AK", "HI"]) {
    const [seat, box] = await Promise.all([feature(page, `seat-US-${code}`).boundingBox(), page.locator(`${at("board")} .cz-inset[data-code="${code}"]`).first().boundingBox()]);
    expect(seat.x >= box.x && seat.x + seat.width <= box.x + box.width && seat.y >= box.y && seat.y + seat.height <= box.y + box.height, code).toBe(true);
  }
});

test("on a map of Japan's prefectures a seat is a 県庁所在地 in Japanese and a prefectural capital in English", async ({ page }) => {
  await open(page, "?map=divisions:jp&lang=ja");
  await page.locator('[data-testid="feature-find"]').fill("那覇");
  await expect(page.locator("#feature-list tbody tr").first().locator("td").nth(3)).toHaveText("県庁所在地");
  await open(page, "?map=divisions:jp");
  await page.locator('[data-testid="feature-find"]').fill("Naha");
  await expect(page.locator("#feature-list tbody tr").first().locator("td").nth(3)).toHaveText("Prefectural capital");
});

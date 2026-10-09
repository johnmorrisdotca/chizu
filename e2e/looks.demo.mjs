// How the demo looks and holds still: a steady box, nothing selectable, finger-sized buttons, light and dark, and the
// words in Japanese, at a phone's width and a desk's.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, svg } from "./demo.mjs";

const MODES = ["explore", "quiz", "callouts", "colour"];

test("the map keeps one steady box in every mode, and a choice or an answer never moves it", async ({ page }, testInfo) => {
  await open(page, "?seed=3&map=world");
  const measure = (selector) => page.locator(selector).evaluate((node) => { const r = node.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; });
  const before = await measure(`${at("board")} .czm-stage`);
  for (const mode of MODES) {
    await page.locator(`${at("modes")} button[data-value="${mode}"]`).click();
    const after = await measure(`${at("board")} .czm-stage`);
    expect(Math.abs(after.width - before.width), mode).toBeLessThan(0.5);
    expect(Math.abs(after.height - before.height), mode).toBeLessThan(0.5);
    expect(Math.abs(after.y - before.y), mode).toBeLessThan(0.5);
  }
  await page.locator(`${at("modes")} button[data-value="quiz"]`).click();
  await page.locator(`${at("choices")} button`).first().click();
  const answered = await measure(`${at("board")} .czm-stage`);
  expect(Math.abs(answered.height - before.height)).toBeLessThan(0.5);
  expect(testInfo.project.name).toBeTruthy();
});

test("nothing on the map can be selected, and every button is a finger wide", async ({ page }) => {
  await open(page);
  const surface = await page.evaluate(() => ["svg.chizu", ".cz-land", ".czm-stage"].map((name) => getComputedStyle(document.querySelector(`#board ${name}`)).userSelect));
  expect(surface.every((value) => value === "none")).toBe(true);
  for (const mode of MODES) {
    await page.locator(`${at("modes")} button[data-value="${mode}"]`).click();
    const small = await page.evaluate(() => [...document.querySelectorAll("#board button, nav button, .fam-seg button, #choices button")].filter((one) => one.offsetParent !== null).map((one) => ({ name: one.textContent.trim() || one.dataset.action, ...one.getBoundingClientRect().toJSON() })).filter((one) => one.width < 43.5 || one.height < 43.5));
    expect(small, mode).toEqual([]);
  }
});

for (const mode of MODES) {
  test(`${mode} fits the page in light and dark without a sideways scroll, with the sea and the land in the colours of each`, async ({ page }) => {
    for (const scheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: scheme });
      await open(page, `?mode=${mode}&seed=4&map=divisions:fr`);
      await expect(svg(page)).toBeVisible();
      await noSidewaysScroll(page);
      const sea = await page.locator(`${at("board")} .cz-sea`).evaluate((node) => getComputedStyle(node).fill);
      expect(sea).toBe(scheme === "dark" ? "rgb(24, 48, 61)" : "rgb(207, 227, 238)");
      const land = await page.locator(`${at("board")} .cz-land`).first().evaluate((node) => getComputedStyle(node).fill);
      expect(land).toBe(scheme === "dark" ? "rgb(74, 74, 61)" : "rgb(233, 225, 200)");
    }
  });
}

test("in Japanese the page, the map and the quiz speak Japanese, and nothing sticks out of the page", async ({ page }) => {
  await open(page, "?mode=quiz&seed=5&lang=ja&map=world");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await expect(page.locator(`${at("board")} [data-action="zoom-in"]`)).toHaveAttribute("aria-label", "拡大");
  await expect(svg(page)).toHaveAttribute("aria-label", "世界の地図");
  await expect(page.locator(at("next"))).toHaveText("つぎの問題");
  await noSidewaysScroll(page);
  for (const mode of MODES) {
    await page.locator(`${at("modes")} button[data-value="${mode}"]`).click();
    await noSidewaysScroll(page);
  }
});

test("a long name in the table scrolls inside its own box, never the page", async ({ page }) => {
  await open(page, "?map=divisions:gb");
  await noSidewaysScroll(page);
  await expect(page.locator("#names tbody tr")).toHaveCount(232);
});

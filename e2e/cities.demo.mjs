// The cities: the switch that names them from kuni's list, more as the map is zoomed in, no name over another, in both
// languages, none on a map of a country's regions, and the choice kept in the address.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, tap } from "./demo.mjs";

const cities = (page) => page.locator(`${at("board")} .cz-city`);
const cityIds = (page) =>
  page.locator(`${at("board")} .cz-city`).evaluateAll((all) => all.map((one) => one.getAttribute("data-city")));

/** Every pair of city names whose drawn boxes cross, as the browser measured them: none is wanted. */
const crossingNames = (page) =>
  page.evaluate(() => {
    const boxes = [...document.querySelectorAll('[data-testid="board"] .cz-city-label')].map((text) => {
      const box = text.getBoundingClientRect();
      return { name: text.textContent, box };
    });
    const crossing = [];
    for (let i = 0; i < boxes.length; i += 1)
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i].box;
        const b = boxes[j].box;
        // A pixel of give: a name's halo may touch the next one's.
        if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1)
          crossing.push(`${boxes[i].name} / ${boxes[j].name}`);
      }
    return crossing;
  });

test("the world names no cities until they are turned on, then names more as it is zoomed in, and remembers the choice", async ({
  page,
}, testInfo) => {
  const errors = await open(page, "?map=world");
  await expect(cities(page)).toHaveCount(0);
  await tap(page, `${at("cities")} button[data-value="true"]`, testInfo);
  await expect(page.locator(`${at("board")} .cz-city[data-city="Q1490"]`)).toHaveCount(1);
  expect(page.url()).toContain("cities=on");
  const whole = await cityIds(page);
  expect(whole.length).toBeGreaterThan(5);
  expect(await crossingNames(page)).toEqual([]);
  for (let step = 0; step < 3; step += 1) await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  await expect(page.locator(at("board")).locator(".czm-stage")).toHaveAttribute("data-zoom", "4");
  await expect.poll(async () => (await cityIds(page)).filter((id) => !whole.includes(id)).length).toBeGreaterThan(0);
  expect(await crossingNames(page)).toEqual([]);
  await tap(page, `${at("cities")} button[data-value="false"]`, testInfo);
  await expect(cities(page)).toHaveCount(0);
  expect(page.url()).not.toContain("cities=");
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("in Japanese the cities are named in Japanese, with no name over another", async ({ page }) => {
  const errors = await open(page, "?lang=ja&map=world&cities=on");
  const tokyo = page.locator(`${at("board")} .cz-city[data-city="Q1490"]`);
  await expect(tokyo.locator("title")).toHaveText("東京都");
  await expect(tokyo.locator(".cz-city-label")).toBeVisible();
  expect(await crossingNames(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test("a country alone names its cities, and a map of its regions names none", async ({ page }) => {
  const errors = await open(page, "?map=country:jp&cities=on");
  await expect.poll(async () => (await cityIds(page)).length).toBeGreaterThan(3);
  expect(await crossingNames(page)).toEqual([]);
  await open(page, "?map=divisions:jp&cities=on");
  await expect(page.locator(`${at("board")} svg.chizu`)).toBeVisible();
  await expect(cities(page)).toHaveCount(0);
  expect(errors).toEqual([]);
});

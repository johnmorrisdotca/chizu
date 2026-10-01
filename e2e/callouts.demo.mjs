// The callout placer: numbered circles in open water, leader lines that never cross, placed again for the window.
import { expect, test } from "@playwright/test";

import { at, open, svg } from "./demo.mjs";

/** The leaders and circles the drawing holds, as numbers. */
const spots = (page) =>
  page.locator(`${at("board")} .cz-callout`).evaluateAll((nodes) =>
    nodes.map((node) => {
      const line = node.querySelector(".cz-leader");
      const circle = node.querySelector(".cz-callout-circle");
      return { code: node.dataset.code, number: Number(node.dataset.number), x1: +line.getAttribute("x1"), y1: +line.getAttribute("y1"), x2: +line.getAttribute("x2"), y2: +line.getAttribute("y2"), cx: +circle.getAttribute("cx"), cy: +circle.getAttribute("cy"), r: +circle.getAttribute("r") };
    }),
  );

const crossings = (list) => {
  const turn = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  let count = 0;
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const [a, b, c, d] = [[list[i].x1, list[i].y1], [list[i].cx, list[i].cy], [list[j].x1, list[j].y1], [list[j].cx, list[j].cy]];
      if (turn(a, b, c) > 0 !== turn(a, b, d) > 0 && turn(c, d, a) > 0 !== turn(c, d, b) > 0) count += 1;
    }
  }
  return count;
};

test("twenty countries are numbered on the world, each with a legend line, no two circles touching and no two leaders crossing", async ({ page }) => {
  const errors = await open(page, "?mode=callouts");
  const list = await spots(page);
  expect(list).toHaveLength(20);
  await expect(page.locator(`${at("legend")} li`)).toHaveCount(20);
  await expect(page.locator(`${at("legend")} li`).first()).toHaveText("Japan");
  expect(list.map((spot) => spot.number).sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  expect(crossings(list)).toBe(0);
  for (let i = 0; i < list.length; i += 1) for (let j = i + 1; j < list.length; j += 1) expect(Math.hypot(list[i].cx - list[j].cx, list[i].cy - list[j].cy)).toBeGreaterThanOrEqual(list[i].r * 2);
  // Each number is a circle with its number in it, named for a screen reader.
  await expect(page.locator(`${at("board")} .cz-callout[data-code="JP"] title`)).toHaveText("Number 1: Japan");
  expect(errors).toEqual([]);
});

test("the numbers keep clear of the buttons in the map's corner", async ({ page }) => {
  await open(page, "?mode=callouts&map=divisions:de");
  const stage = await page.locator(`${at("board")} .czm-stage`).boundingBox();
  const buttons = await page.locator(`${at("board")} .czm-controls`).boundingBox();
  const circles = await page.locator(`${at("board")} .cz-callout-circle`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
  expect(circles).toHaveLength(16);
  for (const circle of circles) {
    const overlaps = circle.left < buttons.x + buttons.width && circle.right > buttons.x && circle.top < buttons.y + buttons.height && circle.bottom > buttons.y;
    expect(overlaps, JSON.stringify(circle)).toBe(false);
    expect(circle.left).toBeGreaterThanOrEqual(stage.x - 1);
    expect(circle.right).toBeLessThanOrEqual(stage.x + stage.width + 1);
  }
});

test("zooming places the numbers again for what the window shows, and a country out of the window loses its number", async ({ page }) => {
  await open(page, "?mode=callouts");
  expect(await spots(page)).toHaveLength(20);
  await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  await page.locator(`${at("board")} [data-action="zoom-in"]`).click();
  const zoomed = await spots(page);
  expect(zoomed.length).toBeLessThan(20);
  expect(zoomed.length).toBeGreaterThan(0);
  expect(crossings(zoomed)).toBe(0);
  const [x, y, w, h] = (await svg(page).getAttribute("viewBox")).split(" ").map(Number);
  for (const spot of zoomed) {
    expect(spot.cx).toBeGreaterThanOrEqual(x);
    expect(spot.cx).toBeLessThanOrEqual(x + w);
    expect(spot.cy).toBeGreaterThanOrEqual(y);
    expect(spot.cy).toBeLessThanOrEqual(y + h);
  }
});

test("numbered west to east, the legend and the numbers follow the map and not the list", async ({ page }) => {
  await open(page, "?mode=callouts&map=divisions:de");
  const given = await page.locator(`${at("legend")} li`).allTextContents();
  await page.locator(`${at("numbering")} button[data-value="west-to-east"]`).click();
  const across = await page.locator(`${at("legend")} li`).allTextContents();
  expect(across).not.toEqual(given);
  expect([...across].sort()).toEqual([...given].sort());
  const list = await spots(page);
  const byNumber = [...list].sort((a, b) => a.number - b.number);
  const first = byNumber[0].code;
  await expect(page.locator(`${at("legend")} li`).first()).toHaveAttribute("data-code", first);
  const xs = byNumber.map((spot) => spot.x1);
  expect(xs).toEqual([...xs].sort((a, b) => a - b));
});

test("Tidy finishes with the slow pass, and the result still has no crossings", async ({ page }) => {
  await open(page, "?mode=callouts&map=divisions:fr&polish=on");
  await expect(page.locator(`${at("polish")} button[data-value="true"]`)).toHaveAttribute("aria-pressed", "true");
  const list = await spots(page);
  expect(list).toHaveLength(30);
  expect(crossings(list)).toBe(0);
});

test("an inset's region is numbered where it is drawn, in its dashed box", async ({ page }) => {
  await open(page, "?mode=callouts&map=divisions:us");
  await expect(page.locator(`${at("board")} .cz-inset`)).toHaveCount(2);
  const alaska = (await spots(page)).find((spot) => spot.code === "AK");
  const frame = await page.locator(`${at("board")} .cz-inset[data-code="AK"]`).evaluate((node) => ({ x: +node.getAttribute("x"), y: +node.getAttribute("y"), width: +node.getAttribute("width"), height: +node.getAttribute("height") }));
  expect(alaska.x1).toBeGreaterThanOrEqual(frame.x);
  expect(alaska.x1).toBeLessThanOrEqual(frame.x + frame.width);
  expect(alaska.y1).toBeGreaterThanOrEqual(frame.y);
  expect(alaska.y1).toBeLessThanOrEqual(frame.y + frame.height);
});

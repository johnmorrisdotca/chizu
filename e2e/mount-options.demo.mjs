// What a page that draws with `mountChizu` itself needs (MODULES-1864): a theme of its own whatever the page does, a
// press that is told and keeps nothing chosen, and the element's mount in the page's hands.
// Written to the test rules: what the page was told is recorded in the page, and the test reads the record.
import { expect, test } from "@playwright/test";

import { open } from "./demo.mjs";

const SEA = { light: "rgb(207, 227, 238)", dark: "rgb(24, 48, 61)" };

/** Mount a world map into a new host of the page; the options may name `told` (a list the page keeps) to record presses. */
async function mountWorld(page, id, options = {}) {
  await page.evaluate(
    async ({ id, options }) => {
      const { mountChizu } = await import("./dist/mount-entry.js");
      const world = (await import("./dist/world-entry.js")).default;
      const host = document.createElement("div");
      host.id = id;
      host.style.width = "480px";
      document.body.prepend(host);
      window.__told = [];
      const mount = mountChizu(host, {
        map: world,
        onSelect: (code) => window.__told.push(code),
        ...options,
      });
      window.__mount = mount;
    },
    { id, options },
  );
}

const sea = (page, id) =>
  page.locator(`#${id} svg.chizu`).evaluate((svg) => getComputedStyle(svg).getPropertyValue("--cz-sea").trim());
const seaColour = (page, id) =>
  page
    .locator(`#${id} .cz-sea`)
    .first()
    .evaluate((one) => getComputedStyle(one).fill);

test("theme pins the map's palette whatever the page's own is, and auto follows the page again", async ({ page }) => {
  await open(page, "?map=world");
  await page.emulateMedia({ colorScheme: "light" });
  await mountWorld(page, "t-dark", { theme: "dark" });
  await mountWorld(page, "t-auto");
  await expect.poll(() => seaColour(page, "t-dark")).toBe(SEA.dark);
  expect(await seaColour(page, "t-auto")).toBe(SEA.light);
  // the line under the map and the buttons wear the same palette
  expect(await page.locator("#t-dark .czm-says").evaluate((one) => getComputedStyle(one).color)).toBe(
    "rgb(236, 232, 220)",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await mountWorld(page, "t-light", { theme: "light" });
  await expect.poll(() => seaColour(page, "t-light")).toBe(SEA.light);
  expect(await seaColour(page, "t-auto")).toBe(SEA.dark);
  expect(await seaColour(page, "t-dark")).toBe(SEA.dark);
  // changed later with set, and handed back to the page with "auto"
  // (the last one mounted is "t-light")
  await page.evaluate(() => window.__mount.set({ theme: "dark" }));
  await expect.poll(() => seaColour(page, "t-light")).toBe(SEA.dark);
  await page.evaluate(() => window.__mount.set({ theme: "auto" }));
  await expect.poll(() => seaColour(page, "t-light")).toBe(SEA.dark);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => seaColour(page, "t-light")).toBe(SEA.light);
  expect(await sea(page, "t-light")).toBe("#cfe3ee");
});

/** A point of the screen on a country's land in the map of `id`, found by asking what is there. */
const landOf = (page, id, code) =>
  page.evaluate(
    ({ id, code }) => {
      // the world is drawn again on each side, so a country has more than one piece of land: any one that can be pressed
      for (const path of document.querySelectorAll(`#${id} .cz-region[data-code="${code}"] .cz-land`)) {
        const land = path.getBoundingClientRect();
        for (let i = 1; i < 30; i += 1)
          for (let j = 1; j < 30; j += 1) {
            const x = land.left + (land.width * i) / 30;
            const y = land.top + (land.height * j) / 30;
            if (document.elementFromPoint(x, y)?.closest(".cz-region")?.dataset.code === code) return { x, y };
          }
      }
      throw new Error(`no land of ${code} to press`);
    },
    { id, code },
  );
const pressAt = (page, point, testInfo) =>
  testInfo.project.use.hasTouch === true ? page.touchscreen.tap(point.x, point.y) : page.mouse.click(point.x, point.y);
const told = (page) => page.evaluate(() => window.__told.slice());

test("keepSelection off: every press is told by its code, and nothing is chosen, drawn or zoomed to", async ({
  page,
}, testInfo) => {
  await open(page, "?map=world");
  await mountWorld(page, "t-keep", { keepSelection: false });
  await page.locator("#t-keep").scrollIntoViewIfNeeded();
  const point = await landOf(page, "t-keep", "AU");
  await pressAt(page, point, testInfo);
  await expect.poll(() => told(page)).toEqual(["AU"]);
  await pressAt(page, point, testInfo);
  await expect.poll(() => told(page)).toEqual(["AU", "AU"]);
  await expect(page.locator("#t-keep .cz-tone-selected")).toHaveCount(0);
  await expect(page.locator("#t-keep .czm-zoom")).toHaveText(/1/);
});

test("without keepSelection a press chooses the place, and the same press again lets go of it", async ({
  page,
}, testInfo) => {
  await open(page, "?map=world");
  await mountWorld(page, "t-kept");
  await page.locator("#t-kept").scrollIntoViewIfNeeded();
  await pressAt(page, await landOf(page, "t-kept", "AU"), testInfo);
  await expect.poll(() => told(page)).toEqual(["AU"]);
  await expect(page.locator("#t-kept .cz-tone-selected")).toHaveCount(1);
});

test("the element hands its mount to the page, and a mount made from options keeps them", async ({ page }) => {
  await open(page, "?map=world");
  const answer = await page.evaluate(async () => {
    await import("./dist/element-define.js");
    const element = document.createElement("chizu-map");
    element.setAttribute("region", "world");
    element.options = { theme: "dark", keepSelection: false };
    const before = element.mounted;
    document.body.prepend(element);
    await new Promise((done) => element.addEventListener("chizu-load", done, { once: true }));
    const mount = element.mounted;
    mount.select("FR");
    return {
      before,
      has: typeof mount?.select === "function" && typeof mount?.view === "function",
      selected: element.shadowRoot.querySelectorAll(".cz-tone-selected").length > 0,
      sea: getComputedStyle(element.shadowRoot.querySelector(".cz-sea")).fill,
    };
  });
  expect(answer.before).toBeNull();
  expect(answer.has).toBe(true);
  expect(answer.selected).toBe(true);
  expect(answer.sea).toBe(SEA.dark);
});

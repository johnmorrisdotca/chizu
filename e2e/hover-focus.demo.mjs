// A place named when the pointer rests on it or the keyboard reaches it (`onHover`, `onFocus`; `chizu-hover`, `chizu-focus`):
// the mouse says it, a finger never does, a drag says nothing, and Shift with an arrow key moves the focus between places.
// Written to the test rules: what the page said is recorded in the page (a log), and the test reads the record.
import { expect, test } from "@playwright/test";

import { at, open, pointOn, serve } from "./demo.mjs";

// A busy machine: Chromium runs at a quarter of its speed, so a test that only passes on a quiet one fails here.
test.beforeEach(async ({ page, browserName }) => {
  if (browserName !== "chromium") return;
  await (await page.context().newCDPSession(page)).send("Emulation.setCPUThrottlingRate", { rate: 4 });
});

const stage = (page) => page.locator(`${at("board")} .czm-stage`);
const sayings = (page) => page.evaluate(() => window.__said.slice());

/** Record every change of the demo's line that names the place pointed at or focused (the line is the demo's `onHover` and `onFocus`). */
async function record(page) {
  await page.evaluate(() => {
    window.__said = [];
    new MutationObserver(() =>
      window.__said.push(document.querySelector('[data-testid="pointing"]').textContent),
    ).observe(document.querySelector('[data-testid="pointing"]'), {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
}

test("the mouse resting on a country names it, leaving it takes the name away, and a drag says nothing", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.use.hasTouch === true, "a mouse; the touch test is below");
  await open(page, "?map=world");
  await record(page);
  await page.locator(at("board")).scrollIntoViewIfNeeded();
  const au = await pointOn(page, "AU");
  await page.mouse.move(au.x, au.y);
  await expect.poll(() => sayings(page)).toContain("Pointing at Australia");
  // away, over the sea
  await page.mouse.move(2, 2);
  await expect.poll(() => sayings(page).then((all) => all.at(-1))).toBe("");
  // a drag that starts on a country: nothing is said while it lasts, not even for the countries it passes over
  await page.mouse.move(au.x, au.y);
  await expect.poll(() => sayings(page).then((all) => all.at(-1))).toBe("Pointing at Australia");
  await page.mouse.down();
  await expect.poll(() => sayings(page).then((all) => all.at(-1))).toBe("");
  const before = (await sayings(page)).length;
  for (let step = 1; step <= 12; step += 1) await page.mouse.move(au.x - step * 25, au.y + step * 5);
  await page.mouse.up();
  expect((await sayings(page)).slice(before).filter((text) => text !== "")).toEqual([]);
});

test("a finger on a country chooses it and never says it is hovering", async ({ page }, testInfo) => {
  test.skip(testInfo.project.use.hasTouch !== true, "a finger");
  await open(page, "?map=world");
  await record(page);
  await page.locator(at("board")).scrollIntoViewIfNeeded();
  const au = await pointOn(page, "AU");
  await page.touchscreen.tap(au.x, au.y);
  await expect(page.locator(at("info-name"))).toHaveText("Australia · オーストラリア");
  expect((await sayings(page)).filter((text) => text.startsWith("Pointing"))).toEqual([]);
});

test("the map is one tab stop; Shift and an arrow move the focus between places, Enter chooses one, Escape gives the focus back", async ({
  page,
}) => {
  await open(page, "?map=world");
  await record(page);
  await stage(page).focus();
  const viewBox = () => page.locator(`${at("board")} svg.chizu`).getAttribute("viewBox");
  const held = () => page.evaluate(() => document.activeElement?.dataset?.code ?? document.activeElement?.className);
  const whole = await viewBox();
  await page.keyboard.press("Shift+ArrowRight");
  const first = await held();
  expect(first).toMatch(/^[A-Z]{2}$/);
  await expect.poll(() => sayings(page).then((all) => all.at(-1))).toMatch(/^Keyboard on .+/);
  // Shift and an arrow did not move the map
  expect(await viewBox()).toBe(whole);
  await page.keyboard.press("Shift+ArrowDown");
  const second = await held();
  expect(second).toMatch(/^[A-Z]{2}$/);
  expect(second).not.toBe(first);
  // Enter presses the place: it is chosen, the map zooms to it, and the focus is still on it
  await page.keyboard.press("Enter");
  await expect(page.locator(`${at("board")} .cz-region[data-code="${second}"]`).first()).toHaveClass(
    /cz-tone-selected/,
  );
  await expect.poll(held).toBe(second);
  await expect.poll(() => sayings(page).then((all) => all.at(-1))).toMatch(/^Keyboard on .+/);
  // the bare arrow keys still move the map
  const zoomed = await viewBox();
  await page.keyboard.press("ArrowRight");
  await expect.poll(viewBox).not.toBe(zoomed);
  // Escape gives the focus back to the map and takes the name away
  await page.keyboard.press("Escape");
  await expect.poll(held).toBe("czm-stage");
  await expect.poll(() => sayings(page).then((all) => all.at(-1))).toBe("");
  // Tab from the map leaves it (to the zoom buttons, where the browser tabs to buttons): it does not go through the countries
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.dataset?.code)).toBeUndefined();
  expect(
    await stage(page).evaluate(
      (element) =>
        element.contains(document.activeElement) &&
        document.activeElement !== element &&
        document.activeElement.closest(".czm-controls") === null,
    ),
  ).toBe(false);
});

test("<chizu-map> sends chizu-hover and chizu-focus with the code of the place", async ({ page }, testInfo) => {
  await serve(page);
  await page.goto("http://chizu.test/embed/?region=world");
  const map = page.locator("chizu-map");
  await expect(map).toHaveAttribute("data-ready", "true");
  await map.evaluate((element) => {
    window.__events = [];
    for (const type of ["chizu-hover", "chizu-focus"])
      element.addEventListener(type, (event) => window.__events.push([type, event.detail.code, event.detail.region]));
  });
  const events = () => page.evaluate(() => window.__events.slice());
  if (testInfo.project.use.hasTouch !== true) {
    await map.locator('.cz-region[data-code="AU"]').hover();
    await expect.poll(events).toContainEqual(["chizu-hover", "AU", expect.any(String)]);
    await page.mouse.move(2, 2);
    await expect.poll(() => events().then((all) => all.at(-1))).toEqual(["chizu-hover", null, expect.any(String)]);
  }
  await map.locator(".czm-stage").focus();
  await page.keyboard.press("Shift+ArrowRight");
  await expect
    .poll(() => events().then((all) => all.filter(([type]) => type === "chizu-focus").at(-1)?.[1]))
    .toMatch(/^[A-Z]{2}$/);
  await page.keyboard.press("Escape");
  await expect
    .poll(() => events().then((all) => all.filter(([type]) => type === "chizu-focus").at(-1)?.[1]))
    .toBeNull();
});

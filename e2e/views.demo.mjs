// A point of view on a disputed place (MODULES-1614): the demo's choice, and `view` on mountChizu. Natural Earth's own lines
// stay the default; Ukraine's draws Crimea in Ukraine, Japan's draws the Northern Territories in Japan.
// Written to the test rules: what the map drew is read from the map's own data attributes and paths.
import { expect, test } from "@playwright/test";

import { at, open } from "./demo.mjs";

const pathOf = (page, code) =>
  page
    .locator(`${at("board")} .cz-region[data-code="${code}"] .cz-land`)
    .first()
    .getAttribute("d");
const pieces = (path) => (path.match(/M/g) ?? []).length;

test("the demo's view row starts on Natural Earth's lines; Ukraine's puts Crimea in Ukraine, and the note says so in both languages", async ({
  page,
}) => {
  const errors = await open(page, "?map=world");
  await expect(page.locator(at("view-note"))).toBeHidden();
  const russia = pieces((await pathOf(page, "RU")) ?? "");
  const ukraine = (await pathOf(page, "UA")) ?? "";
  await page.locator(`${at("view")} [data-value="ukr"]`).click();
  await expect.poll(async () => pieces((await pathOf(page, "RU")) ?? "")).toBe(russia - 1);
  expect(await pathOf(page, "UA")).not.toBe(ukraine);
  await expect(page.locator(`${at("view")} [data-value="ukr"]`)).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(at("view-note"))).toContainText("Crimea and Sevastopol are drawn in Ukraine");
  expect(page.url()).toContain("view=ukr");
  // back to the default: the very lines it began with
  await page.locator(`${at("view")} [data-value="default"]`).click();
  await expect.poll(async () => pieces((await pathOf(page, "RU")) ?? "")).toBe(russia);
  expect(await pathOf(page, "UA")).toBe(ukraine);
  await expect(page.locator(at("view-note"))).toBeHidden();
  expect(errors).toEqual([]);
});

test("an address that names a view opens on it, in Japanese too", async ({ page }) => {
  const errors = await open(page, "?map=world&view=ukr&lang=ja");
  await expect(page.locator(at("view-note"))).toContainText("クリミアとセヴァストポリ");
  await expect(page.locator(`${at("view")} [data-value="ukr"]`)).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});

test("mountChizu draws a view when it arrives, goes back to the default on null, and follows a change of map", async ({
  page,
}) => {
  await open(page, "?map=world");
  const result = await page.evaluate(async () => {
    const { mountChizu } = await import("./dist/mount-entry.js");
    const world = (await import("./dist/world-entry.js")).default;
    const host = document.createElement("div");
    host.id = "t-view";
    host.style.width = "480px";
    document.body.prepend(host);
    const pieces = () =>
      (host.querySelector('.cz-region[data-code="RU"] .cz-land').getAttribute("d").match(/M/g) ?? []).length;
    const waitFor = async (test) => {
      for (let i = 0; i < 100 && !test(); i += 1) await new Promise((done) => setTimeout(done, 50));
    };
    const mount = mountChizu(host, { map: world, view: "ukr" });
    const first = pieces();
    await waitFor(() => pieces() !== first);
    const withView = pieces();
    mount.set({ view: null });
    await waitFor(() => pieces() === first);
    const back = pieces();
    mount.set({ view: "jpn" });
    // Japan's view does not change the 1:110m world: nothing to wait for, and nothing different drawn
    await new Promise((done) => setTimeout(done, 400));
    return { first, withView, back, jpan: pieces() };
  });
  expect(result.withView).toBe(result.first - 1);
  expect(result.back).toBe(result.first);
  expect(result.jpan).toBe(result.first);
});

test("a region whose status is disputed says so in its card, in both languages, and others do not", async ({
  page,
}) => {
  const errors = await open(page, "?map=world&select=XK");
  await expect(page.locator(at("info-disputed"))).toContainText("Kosovo declared independence in 2008");
  await open(page, "?map=world&select=JP");
  await expect(page.locator(at("info-disputed"))).toBeHidden();
  await open(page, "?map=world&select=TW&lang=ja");
  await expect(page.locator(at("info-disputed"))).toContainText("中華人民共和国");
  expect(errors).toEqual([]);
});

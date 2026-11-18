// The world's 62 smallest countries are dots only where asked: a quiz asks them, a map draws them on request.
import { expect, test } from "@playwright/test";

import { at, open, region } from "./demo.mjs";

test("the explore view of the world has its 173 outlines and no dots; the quiz has the dots too", async ({ page }) => {
  await open(page, "?map=world");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(173);
  await expect(region(page, "SG")).toHaveCount(0);
  await open(page, "?map=world&mode=quiz&seed=3");
  await expect(page.locator(`${at("board")} .cz-region`)).toHaveCount(235);
  await expect(region(page, "SG")).toHaveCount(1);
  await expect(region(page, "MT").locator("path.cz-land")).toHaveCount(1);
});

test("a quiz of Polynesia, all dots on the 1:110m world, is a round of its nine countries", async ({ page }) => {
  const errors = await open(page, "?map=world&part=061&mode=quiz&seed=5");
  await expect(page.locator(at("progress"))).toHaveText("Question 1 of 9");
  const target = await page
    .locator(`${at("board")} .cz-tone-selected`)
    .first()
    .getAttribute("data-code");
  const small = await page.evaluate(
    async (code) =>
      (await import("./dist/index.js"))
        .withSmallStates((await import("./dist/world-entry.js")).default)
        .regions.find((one) => one.code === code)?.small,
    target,
  );
  expect(small).toBe(true);
  await expect(page.locator(`${at("choices")} button`)).toHaveCount(4);
  expect(errors).toEqual([]);
});

test("mountChizu and the elements draw the dots only when asked, and the quiz element by default", async ({ page }) => {
  await open(page, "?map=world");
  await page.evaluate(async () => {
    await import("./dist/element-define.js");
    const { mountChizu } = await import("./dist/mount-entry.js");
    const world = (await import("./dist/world-entry.js")).default;
    const add = (tag, id, attributes = {}) => {
      const element = document.createElement(tag);
      element.id = `t-${id}`;
      element.setAttribute("region", "world");
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      document.body.append(element);
    };
    add("chizu-map", "plain");
    add("chizu-map", "dotted", { "small-states": "" });
    add("chizu-map", "off", { "small-states": "off" });
    add("chizu-quiz", "quiz", { seed: "2" });
    add("chizu-quiz", "quiz-off", { seed: "2", "small-states": "off" });
    for (const [id, options] of [
      ["m-plain", {}],
      ["m-dotted", { smallStates: true }],
    ]) {
      const host = document.createElement("div");
      host.id = `t-${id}`;
      document.body.append(host);
      mountChizu(host, { map: world, ...options });
    }
  });
  for (const [id, count] of [
    ["plain", 173],
    ["dotted", 235],
    ["off", 173],
    ["quiz", 235],
    ["quiz-off", 173],
    ["m-plain", 173],
    ["m-dotted", 235],
  ]) {
    await expect(page.locator(`#t-${id} .cz-region`), id).toHaveCount(count);
  }
});

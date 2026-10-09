// A continent or a subregion of the world, and the parts of a country's map: framed, the rest faded, and the quiz
// and the numbers kept to it.
import { expect, test } from "@playwright/test";

import { at, open, region } from "./demo.mjs";

test("a continent from the map chooser is the world framed on it, with the rest faded", async ({ page }) => {
  const errors = await open(page, "?map=world");
  await page.locator(at("map")).selectOption("continent:AF");
  await expect(page.locator(at("part"))).toHaveValue("AF");
  await expect(region(page, "KE")).not.toHaveClass(/cz-tone-faint/);
  await expect(region(page, "FR")).toHaveClass(/cz-tone-faint/);
  await expect(page.locator("#names tbody tr")).toHaveCount(50);
  await expect(page.locator(`${at("board")} .czm-stage`)).not.toHaveAttribute("data-zoom", "1");
  await expect(page).toHaveURL(/part=AF/);
  expect(errors).toEqual([]);
});

test("the world's parts are its continents and the UN's subregions, named in Japanese too", async ({ page }) => {
  await open(page, "?map=world&lang=ja");
  const groups = page.locator(`${at("part")} optgroup`);
  await expect(groups).toHaveCount(2);
  await expect(groups.nth(0)).toHaveAttribute("label", "大陸");
  await expect(groups.nth(0).locator("option").first()).toHaveText(/^アフリカ \(\d+\)$/);
  await page.locator(at("part")).selectOption("030");
  await expect(page.locator("#names tbody tr")).toHaveCount(6);
});

test("a quiz on a continent offers only its countries, and callouts number only them", async ({ page }) => {
  await open(page, "?map=world&part=EU&mode=quiz&seed=4");
  const europe = await page.evaluate(async () => (await import("./dist/names-entry.js")).CHIZU_CONTINENTS.find((one) => one.code === "EU").codes);
  for (const code of await page.locator(`${at("choices")} button`).evaluateAll((all) => all.map((button) => button.dataset.code))) expect(europe).toContain(code);
  await page.locator(`${at("modes")} button[data-value="callouts"]`).click();
  const numbered = await page.locator(`${at("board")} .cz-callout`).evaluateAll((all) => all.map((node) => node.dataset.code));
  expect(numbered.length).toBeGreaterThan(5);
  for (const code of numbered) expect(europe).toContain(code);
});

test("Canada's parts are its five regions, and the colour mode paints each its own colour", async ({ page }) => {
  await open(page, "?map=divisions:ca&mode=colour&colour=groups");
  expect(await page.locator(`${at("part")} option`).allTextContents()).toEqual(["All of it", "Prairies (3)", "West Coast (1)", "Atlantic (4)", "North (3)", "Central (2)"]);
  await expect(page.locator(`${at("colour-legend")} li`)).toHaveCount(5);
  const tones = await page.locator(`${at("board")} .cz-region`).evaluateAll((all) => [...new Set(all.map((node) => node.dataset.tone))]);
  expect(tones.sort()).toEqual(["group1", "group2", "group3", "group4", "group5"]);
});

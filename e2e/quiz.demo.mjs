// The which-one-is-this quiz, built from the engine's own findQuestion: the same seed asks the same questions.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, region } from "./demo.mjs";

test("a question lights one country, offers it among four look-alikes, and does not give the answer away", async ({ page }) => {
  const errors = await open(page, "?mode=quiz&seed=3");
  await expect(page.locator(`${at("question")}`)).toHaveText("Which country is lit on the map?");
  const buttons = page.locator(`${at("choices")} button`);
  await expect(buttons).toHaveCount(4);
  await expect(page.locator(`${at("board")} .cz-tone-selected`).first()).toBeVisible();
  // The map is not read out as "chosen": that would say which it is.
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Nothing chosen");
  await expect(page.locator(at("score"))).toHaveText("0 of 0");
  await expect(page.locator(at("next"))).toBeDisabled();
  // Seed 3 lights Guinea, among its neighbours.
  const lit = await page.locator(`${at("board")} .cz-tone-selected`).first().getAttribute("data-code");
  expect(lit).toBe("GN");
  await expect(page.locator(at("choices"))).toContainText("Sierra Leone");
  await expect(page.locator(at("choices"))).toContainText("Guinea-Bissau");
  expect(errors).toEqual([]);
});

test("the same seed asks the same question, and another seed another", async ({ page }) => {
  await open(page, "?mode=quiz&seed=3");
  const first = await page.locator(`${at("choices")} button`).allTextContents();
  await open(page, "?mode=quiz&seed=3");
  expect(await page.locator(`${at("choices")} button`).allTextContents()).toEqual(first);
  await open(page, "?mode=quiz&seed=11");
  expect(await page.locator(`${at("choices")} button`).allTextContents()).not.toEqual(first);
});

test("a right answer is marked, scored and ends the question; a wrong one shows the right one", async ({ page }) => {
  await open(page, "?mode=quiz&seed=3");
  await page.locator(at("choice-GN")).click();
  await expect(page.locator(at("question"))).toContainText("Right!");
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await expect(page.locator(at("score"))).toHaveText("1 of 1");
  await expect(region(page, "GN")).toHaveClass(/cz-tone-correct/);
  // Done: the choices are spent until the next question.
  for (const button of await page.locator(`${at("choices")} button`).all()) await expect(button).toBeDisabled();
  await expect(page.locator(at("next"))).toBeEnabled();
  await page.locator(at("next")).click();
  await expect(page.locator(at("score"))).toHaveText("1 of 1");
  await expect(page.locator(`${at("choices")} button:not([disabled])`)).toHaveCount(4);
  // Wrong this time.
  const buttons = page.locator(`${at("choices")} button`);
  const target = await page.locator(`${at("board")} .cz-tone-selected`).first().getAttribute("data-code");
  const wrong = (await buttons.evaluateAll((all) => all.map((button) => button.dataset.code))).find((code) => code !== target);
  await page.locator(at(`choice-${wrong}`)).click();
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "wrong");
  await expect(page.locator(at("question"))).toContainText("Not quite");
  await expect(region(page, wrong)).toHaveClass(/cz-tone-wrong/);
  await expect(region(page, target)).toHaveClass(/cz-tone-correct/);
  await expect(page.locator(at("score"))).toHaveText("1 of 2");
});

test("pressing the map does nothing in a quiz, and the quiz works on a country's regions too", async ({ page }) => {
  await open(page, "?mode=quiz&seed=2&map=divisions:de");
  await expect(page.locator(`${at("question")}`)).toHaveText("Which region is lit on the map?");
  const lit = await page.locator(`${at("board")} .cz-tone-selected`).first().getAttribute("data-code");
  // The lit region is framed in the middle of the map: press it, and nothing is chosen, so nothing is read out.
  const box = await page.locator(`${at("board")} .czm-stage`).boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Nothing chosen");
  await expect(page.locator(`${at("board")} .cz-tone-selected`)).toHaveCount(1);
  await expect(page.locator(`${at("board")} .cz-tone-selected`)).toHaveAttribute("data-code", lit);
  await expect(page.locator(`${at("choices")} button`)).toHaveCount(4);
});

test("in Japanese the question, the choices and the verdict are Japanese", async ({ page }) => {
  await open(page, "?mode=quiz&seed=3&lang=ja");
  await expect(page.locator(at("question"))).toHaveText("地図で光っている国はどれでしょう？");
  await expect(page.locator(at("choice-GN"))).toHaveText("ギニア");
  await page.locator(at("choice-GN")).click();
  await expect(page.locator(at("question"))).toContainText("正解です！");
  await expect(page.locator(at("score"))).toHaveText("1問中1問");
});

test("a country alone has nothing to ask about, and says so", async ({ page }) => {
  await open(page, "?mode=quiz&map=country:fr");
  await expect(page.locator(at("question"))).toContainText("needs a map with several places");
  await expect(page.locator(`${at("choices")} button`)).toHaveCount(0);
  await noSidewaysScroll(page);
});

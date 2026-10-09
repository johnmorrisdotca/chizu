// The quiz: rounds of ten made from a seed, so a link asks the same questions; four kinds of question; a streak.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, press, region } from "./demo.mjs";

const lit = (page) => page.locator(`${at("board")} .cz-tone-selected`).first().getAttribute("data-code");

test("a question lights one country, offers it among four look-alikes, and does not give the answer away", async ({ page }) => {
  const errors = await open(page, "?map=world&mode=quiz&seed=3");
  await expect(page.locator(at("question"))).toHaveText("Which country is lit on the map?");
  await expect(page.locator(`${at("choices")} button`)).toHaveCount(4);
  const target = await lit(page);
  await expect(page.locator(at(`choice-${target}`))).toBeVisible();
  // The map is not read out as "chosen": that would say which it is.
  await expect(page.locator(`${at("board")} .czm-says`)).toHaveText("Nothing chosen");
  await expect(page.locator(at("score"))).toHaveText("0 of 0");
  await expect(page.locator(at("progress"))).toHaveText("Question 1 of 10");
  await expect(page.locator(at("next"))).toBeDisabled();
  expect(errors).toEqual([]);
});

test("the same seed asks the same questions in the same order, and another seed others", async ({ page }) => {
  const firstThree = async (query) => {
    await open(page, query);
    const asked = [];
    for (let n = 0; n < 3; n += 1) {
      const target = await lit(page);
      asked.push(`${target}:${(await page.locator(`${at("choices")} button`).allTextContents()).join("|")}`);
      await page.locator(at(`choice-${target}`)).click();
      await page.locator(at("next")).click();
    }
    return asked;
  };
  const once = await firstThree("?map=world&mode=quiz&seed=3");
  expect(await firstThree("?map=world&mode=quiz&seed=3")).toEqual(once);
  expect(await firstThree("?map=world&mode=quiz&seed=11")).not.toEqual(once);
});

test("a right answer is marked, scored and counted in the streak; a wrong one shows the right one and ends the streak", async ({ page }) => {
  await open(page, "?map=world&mode=quiz&seed=3");
  const target = await lit(page);
  await page.locator(at(`choice-${target}`)).click();
  await expect(page.locator(at("question"))).toContainText("Right!");
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await expect(page.locator(at("score"))).toHaveText("1 of 1");
  await expect(page.locator(at("streak"))).toHaveText("Streak 1");
  await expect(page.locator(at("best"))).toHaveText("Best 1");
  await expect(region(page, target)).toHaveClass(/cz-tone-correct/);
  for (const button of await page.locator(`${at("choices")} button`).all()) await expect(button).toBeDisabled();
  await page.locator(at("next")).click();
  await expect(page.locator(at("progress"))).toHaveText("Question 2 of 10");
  const second = await lit(page);
  const wrong = (await page.locator(`${at("choices")} button`).evaluateAll((all) => all.map((button) => button.dataset.code))).find((code) => code !== second);
  await page.locator(at(`choice-${wrong}`)).click();
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "wrong");
  await expect(page.locator(at("question"))).toContainText("Not quite");
  await expect(region(page, wrong)).toHaveClass(/cz-tone-wrong/);
  await expect(region(page, second)).toHaveClass(/cz-tone-correct/);
  await expect(page.locator(at("score"))).toHaveText("1 of 2");
  await expect(page.locator(at("streak"))).toHaveText("Streak 0");
  await expect(page.locator(at("best"))).toHaveText("Best 1");
});

test("Japan's prefectures: typed names are right in English, in Japanese and without the ending, and readings in either kana", async ({ page }) => {
  await open(page, "?mode=quiz&style=type&seed=2");
  await expect(page.locator(at("question"))).toContainText("Type its name");
  const target = await lit(page);
  const names = await page.evaluate(async (code) => {
    const japan = (await import("./dist/data/divisions/jp.js")).default;
    const region = japan.regions.find((one) => one.code === code);
    return { name: region.name, nameJa: region.nameJa, reading: region.reading };
  }, target);
  await page.locator(at("answer")).fill(names.nameJa.replace(/[都道府県]$/u, ""));
  await page.locator(at("check")).click();
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await page.locator(at("next")).click();
  const second = await lit(page);
  const english = await page.evaluate(async (code) => (await import("./dist/data/divisions/jp.js")).default.regions.find((one) => one.code === code).name, second);
  await page.locator(at("answer")).fill(english.toUpperCase());
  await page.locator(at("answer")).press("Enter");
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await expect(page.locator(at("streak"))).toHaveText("Streak 2");
  // A wrong name says what was typed.
  await page.locator(at("next")).click();
  await page.locator(at("answer")).fill("Atlantis");
  await page.locator(at("check")).click();
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "wrong");
  await expect(page.locator(at("question"))).toContainText("You said Atlantis");
  // Readings: the kana mode asks how a name in kanji is read, and katakana is as right as hiragana.
  await open(page, "?mode=quiz&style=kana&seed=2");
  const asked = await lit(page);
  const reading = await page.evaluate(async (code) => (await import("./dist/data/divisions/jp.js")).default.regions.find((one) => one.code === code).reading, asked);
  await expect(page.locator(at("question"))).toContainText("How is");
  const katakana = reading.replace(/[ぁ-ゖ]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) + 0x60));
  await page.locator(at("answer")).fill(katakana);
  await page.locator(at("check")).click();
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await expect(page.locator(at("question"))).toContainText(reading);
});

test("finding a place on the map: the place is not lit, a press answers, and the answer is shown", async ({ page }, testInfo) => {
  await open(page, "?mode=quiz&style=find&seed=5&map=divisions:de");
  await expect(page.locator(at("question"))).toContainText("Press it on the map");
  await expect(page.locator(`${at("board")} .cz-tone-selected`)).toHaveCount(0);
  const target = await page.evaluate(() => {
    const words = document.querySelector('[data-testid="question"]').textContent;
    return [...document.querySelectorAll("#names tbody tr")].find((row) => words.includes(row.children[2].textContent + "?"))?.dataset.code;
  });
  expect(target).toBeTruthy();
  await press(page, target, testInfo);
  await expect(page.locator(at("question"))).toHaveAttribute("data-result", "right");
  await expect(region(page, target)).toHaveClass(/cz-tone-correct/);
});

test("a round is ten questions; at the end it shows the results, a link that asks the same ten, and files to keep", async ({ page }) => {
  await open(page, "?mode=quiz&seed=9");
  for (let n = 1; n <= 10; n += 1) {
    await expect(page.locator(at("progress"))).toHaveText(`Question ${n} of 10`);
    const target = await lit(page);
    await page.locator(at(n % 3 === 0 ? `choice-${(await page.locator(`${at("choices")} button`).evaluateAll((all) => all.map((button) => button.dataset.code))).find((code) => code !== target)}` : `choice-${target}`)).click();
    if (n < 10) await page.locator(at("next")).click();
  }
  await expect(page.locator(at("quiz-summary"))).toBeVisible();
  await expect(page.locator(at("summary-text"))).toHaveText("Round over: 7 of 10 right, best streak 2.");
  await expect(page.locator(`${at("summary-table")} tbody tr`)).toHaveCount(10);
  const link = await page.locator(at("share-link")).inputValue();
  expect(link).toContain("seed=9");
  expect(link).toContain("map=divisions%3Ajp");
  expect(link).toContain("style=choose");
  // The results as a file: CSV, JSON and plain text.
  const download = page.waitForEvent("download");
  await page.locator(at("download-results-csv")).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("chizu-divisions-jp-quiz-9.csv");
  const csv = await (await file.createReadStream()).toArray().then((chunks) => Buffer.concat(chunks).toString("utf8"));
  expect(csv.split("\n")[0]).toBe("No.,code,iso,Place,Reading,Answer,Result");
  expect(csv.trim().split("\n")).toHaveLength(11);
  const json = page.waitForEvent("download");
  await page.locator(at("download-results-json")).click();
  const parsed = JSON.parse(await (await json).createReadStream().then((stream) => stream.toArray()).then((chunks) => Buffer.concat(chunks).toString("utf8")));
  expect(parsed.seed).toBe(9);
  expect(parsed.rows).toHaveLength(10);
  // The link asks the same first question.
  const first = parsed.rows[0].code;
  await open(page, link.replace(/^https?:\/\/[^/]+\//, ""));
  expect(await lit(page)).toBe(first);
  await noSidewaysScroll(page);
});

test("in Japanese the question, the choices and the verdict are Japanese", async ({ page }) => {
  await open(page, "?map=world&mode=quiz&seed=3&lang=ja");
  await expect(page.locator(at("question"))).toHaveText("地図で光っている国はどこでしょう？");
  const target = await lit(page);
  await page.locator(at(`choice-${target}`)).click();
  await expect(page.locator(at("question"))).toContainText("正解です！");
  await expect(page.locator(at("score"))).toHaveText("1問中1問");
  await expect(page.locator(at("streak"))).toHaveText("1問連続");
});

test("a country alone has nothing to ask about, and says so", async ({ page }) => {
  await open(page, "?mode=quiz&map=country:fr");
  await expect(page.locator(at("question"))).toContainText("needs a map with several places");
  await expect(page.locator(`${at("choices")} button`)).toHaveCount(0);
  await noSidewaysScroll(page);
});

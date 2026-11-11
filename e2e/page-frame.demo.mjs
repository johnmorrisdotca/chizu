// The family's page frame (kazoku-ui's page-frame): every page of the demo says what it is, links home and shows its data's
// credits, without opening a menu, on a desk and on a phone, and has a title and a description of its own; each embed
// page has the small credit line in its corner.
import { readdirSync, readFileSync } from "node:fs";
import { pageProblems } from "@johnmorrisdotca/kazoku-ui/page-frame";
import { expect, test } from "@playwright/test";
import { FRAME_TEXTS, NOTICE } from "../scripts/page-frame.mjs";
import { serve } from "./demo.mjs";

/** Each page, and what says it has finished drawing its map. */
const PAGES = [
  { path: "index.html", ready: '[data-testid="board"][data-ready="true"]' },
  { path: "builder.html", ready: '#bld-stage chizu-map[data-ready="true"]' },
];
const EMBEDS = ["embed/", "embed/locator/", "embed/quiz/"];

test("every page the build wrote has a title, a description, the header and the credit line", () => {
  const pages = readdirSync("site").filter((file) => file.endsWith(".html") && file !== "api.html");
  expect(pages).toEqual(expect.arrayContaining(PAGES.map((one) => one.path)));
  for (const name of pages) expect(pageProblems(readFileSync(`site/${name}`, "utf8")), name).toEqual([]);
  for (const path of EMBEDS)
    expect(pageProblems(readFileSync(`site/${path}index.html`, "utf8"), { embed: true }), path).toEqual([]);
});

for (const lang of ["en", "ja"]) {
  for (const { path, ready } of PAGES) {
    test(`${path} in ${lang} says what it is, links home, and shows its credits`, async ({ page }) => {
      await serve(page);
      await page.goto(`http://chizu.test/${path}?lang=${lang}`);
      await expect(page.locator(ready)).toHaveCount(1);
      const { name, what } = FRAME_TEXTS[path][lang];
      const header = page.locator("kazoku-page-header");
      await expect(header).toContainText(name);
      await expect(header).toContainText(what);
      await expect(header.getByRole("link").first()).toBeVisible();
      await expect(page).toHaveTitle(lang === "ja" ? `${name}：${what}` : `${name}: ${what}`);
      const credits = page.locator("kazoku-page-credits");
      await expect(credits).toBeVisible();
      await expect(credits).toContainText("Natural Earth");
      await expect(credits.getByRole("link")).toHaveAttribute("href", NOTICE);
      // once the map has drawn, nothing runs off the side of the page
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
        .toBe(true);
    });
  }
}

for (const path of EMBEDS) {
  test(`${path} has the small credit line in its corner, linking the credits in a new tab`, async ({ page }) => {
    await serve(page);
    await page.goto(`http://chizu.test/${path}?region=world`);
    const credits = page.locator("kazoku-page-credits");
    await expect(credits).toBeVisible();
    await expect(credits).toHaveAttribute("embed", "");
    await expect(credits).toContainText("Natural Earth");
    await expect(credits.getByRole("link")).toHaveAttribute("href", NOTICE);
    await expect(credits.getByRole("link")).toHaveAttribute("target", "_blank");
  });
}

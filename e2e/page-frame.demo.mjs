// The family's page frame (kazoku-ui's page-frame): every page of the demo says what it is, links home and shows its data's
// credits, without opening a menu, on a desk and on a phone, and has a title and a description of its own.
import { readdirSync, readFileSync } from "node:fs";
import { pageProblems } from "@johnmorrisdotca/kazoku-ui/page-frame";
import { expect, test } from "@playwright/test";
import { serve } from "./demo.mjs";

const NOTICE = "https://github.com/johnmorrisdotca/chizu/blob/main/NOTICE.md";
const PAGES = [
  { path: "index.html", en: "maps to explore, quiz and colour", ja: "見て、クイズをして、色を塗る地図" },
  { path: "builder.html", en: "embed builder", ja: "埋め込みを作る" },
];

test("every page the build wrote has a title, a description, the header and the credit line", () => {
  const pages = readdirSync("site").filter((file) => file.endsWith(".html") && file !== "api.html");
  expect(pages).toEqual(expect.arrayContaining(PAGES.map((one) => one.path)));
  for (const name of pages) expect(pageProblems(readFileSync(`site/${name}`, "utf8")), name).toEqual([]);
});

for (const lang of ["en", "ja"]) {
  for (const { path, en, ja } of PAGES) {
    test(`${path} in ${lang} says what it is, links home, and shows its credits`, async ({ page }) => {
      await serve(page);
      await page.goto(`http://chizu.test/${path}?lang=${lang}`);
      const header = page.locator("kazoku-page-header");
      const what = lang === "ja" ? ja : en;
      await expect(header).toContainText(lang === "ja" ? "地図 Chizu" : "Chizu 地図");
      await expect(header).toContainText(what);
      await expect(header.getByRole("link").first()).toBeVisible();
      await expect(page).toHaveTitle(lang === "ja" ? `地図 Chizu：${what}` : `Chizu 地図: ${what}`);
      const credits = page.locator("kazoku-page-credits");
      await expect(credits).toBeVisible();
      await expect(credits).toContainText("Natural Earth");
      await expect(credits.getByRole("link")).toHaveAttribute("href", NOTICE);
      // nothing runs off the side of the page
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });
  }
}

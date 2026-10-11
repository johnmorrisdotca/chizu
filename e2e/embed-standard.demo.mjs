import { expect, test } from "@playwright/test";
import { serve } from "./demo.mjs";

test("the shared builder previews all three makers and writes every host format", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.goto("http://chizu.test/builder.html?lang=en");
  await expect(page.locator("#bld-stage chizu-map")).toHaveAttribute("data-ready", "true");
  for (const maker of ["map", "locator", "quiz"]) {
    await page.locator(`#bld-makers [data-maker="${maker}"]`).click();
    await expect(page.locator(`#bld-stage chizu-${maker}`)).toHaveAttribute("data-ready", "true");
    for (const format of ["element", "iframe", "module", "react", "vue", "svelte", "angular", "html", "url"]) {
      await page.locator(`#bld-formats [data-format="${format}"]`).click();
      await expect(page.locator("#bld-code")).not.toHaveText("");
    }
  }
  await page.locator('[data-lang="ja"]').click();
  await expect(page.locator("#bld-maker-says")).toContainText("問題");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("map figures, false switches, theme and text labels work inside a shadow root", async ({ page }) => {
  await serve(page);
  const label = '<img src=x onerror="bad">';
  const figures = JSON.stringify({ JP: 10, CA: 20 });
  await page.goto(`http://chizu.test/embed/?region=world&data=${encodeURIComponent(figures)}&controls=false&labels=no&theme=dark&label=${encodeURIComponent(label)}`);
  const map = page.locator("chizu-map");
  await expect(map).toHaveAttribute("data-ready", "true");
  await expect(map.locator('[role="group"]').first()).toHaveAttribute("aria-label", label);
  await expect(map.locator('.cz-region[data-code="JP"]').first()).toHaveAttribute("data-tone", "data-0");
  await expect(map.locator('.cz-region[data-code="CA"]').first()).toHaveAttribute("data-tone", "data-4");
  await expect(map.locator('.czm-controls')).toHaveCount(0);
  expect(await map.locator('svg').evaluate((svg) => getComputedStyle(svg).getPropertyValue("--cz-sea").trim())).toBe("#18303d");
  await map.locator("select.choose").selectOption("JP");
  await expect(map.locator(".czm-says")).toContainText("Japan");
  expect(await page.locator("img").count()).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await map.evaluate((element) => { element.highlight = "FR"; element.width = 360; element.options = { labels: ["FR"] }; });
  await expect(map).toHaveAttribute("data-ready", "true");
  await expect(map).toHaveAttribute("highlight", "FR");
});

test("locators frame named water and coordinate pins, and reject unsuitable places", async ({ page }) => {
  await serve(page);
  await page.goto("http://chizu.test/embed/locator/?region=country-jp&place=Q200239&lang=ja");
  const locator = page.locator("chizu-locator");
  await expect(locator).toHaveAttribute("data-ready", "true");
  await expect(locator.locator("p").last()).toHaveText("琵琶湖");
  await expect(locator.locator('.cz-feature[data-code="Q200239"]').first()).toHaveAttribute("data-tone", "selected");
  await page.goto("http://chizu.test/embed/locator/?place=35.69,139.69");
  await expect(page.locator(".locator-pin")).toBeVisible();
  await page.goto("http://chizu.test/embed/locator/?region=divisions-jp&place=35.69,139.69");
  await expect(page.getByRole("status")).toContainText("known projection");
});

test("seeded quizzes repeat, answer by keyboard and forward native detail", async ({ page }) => {
  await serve(page);
  await page.route("http://host.test/", (route) => route.fulfill({ contentType: "text/html", body: '<script>window.messages=[];addEventListener("message",event=>{if(event.origin==="http://chizu.test")messages.push(event.data);});</script><iframe src="http://chizu.test/embed/quiz/?seed=7&width=320" width="360" height="600"></iframe>' }));
  await page.goto("http://host.test/");
  const quiz = page.frameLocator("iframe").locator("chizu-quiz");
  await expect(quiz).toHaveAttribute("data-ready", "true");
  const first = await quiz.locator(".choices button").allTextContents();
  await quiz.locator(".choices button").first().press("Enter");
  await expect(quiz.locator(".result")).not.toHaveText("");
  await expect.poll(() => page.evaluate(() => window.messages.some((message) => message.type === "chizu-answer"))).toBe(true);
  const message = await page.evaluate(() => window.messages.find((made) => made.type === "chizu-answer"));
  expect(message.detail).toMatchObject({ region: "world", seed: 7, round: 1 });
  expect(typeof message.detail.correct).toBe("boolean");
  expect(JSON.parse(JSON.stringify(message))).toEqual(message);
  await page.reload();
  await expect(quiz).toHaveAttribute("data-ready", "true");
  await expect(quiz.locator(".choices button")).toHaveText(first);
});

test("invalid query values are ignored; reconnect and stale map loads keep the latest configuration", async ({ page }) => {
  await serve(page);
  await page.goto("http://chizu.test/embed/?region=not-a-map&width=Infinity&theme=invalid&data=%7B%22JP%22%3A%22bad%22%7D");
  const map = page.locator("chizu-map");
  await expect(map).toHaveAttribute("data-ready", "true");
  for (const name of ["region", "width", "theme", "data"]) await expect(map).not.toHaveAttribute(name, /.*/);
  await map.evaluate(async (element) => {
    element.region = "divisions-ca"; element.region = "divisions-jp";
    const { defineMap } = await import("../dist/element.js"); defineMap("article-map"); defineMap("article-map");
    const parent = element.parentElement; element.remove(); parent.append(element);
  });
  await expect(map).toHaveAttribute("data-ready", "true");
  await expect(map.locator('.czm-stage')).toHaveAttribute("data-map", "divisions-jp");
  expect(await page.evaluate(() => typeof customElements.get("article-map"))).toBe("function");
});


test("copied iframe code fits a narrow article with visible zoom controls and no inner scrolling", async ({ page }) => {
  await serve(page);
  for (const maker of ["map", "locator", "quiz"]) {
    await page.goto("http://chizu.test/builder.html?lang=en");
    await page.locator(`#bld-makers [data-maker="${maker}"]`).click();
    await expect(page.locator(`#bld-stage chizu-${maker}`)).toHaveAttribute("data-ready", "true");
    if (maker === "locator") {
      await page.locator("#bld-groups details").first().evaluate((details) => { details.open = true; });
      await page.locator("#opt-region").selectOption("country-jp");
      await page.locator('[data-option="place"] input').fill("Q200239");
      await expect(page.locator("#bld-stage chizu-locator p").last()).toHaveText("Lake Biwa");
      await expect(page.locator("#bld-stage chizu-locator")).toHaveAttribute("data-ready", "true");
    }
    await page.locator('#bld-formats [data-format="iframe"]').click();
    const code = (await page.locator("#bld-code").textContent()).replaceAll("https://johnmorrisdotca.github.io/chizu/", "http://chizu.test/");
    await page.route("http://article.test/", (route) => route.fulfill({ contentType: "text/html", body: `<style>body{margin:0;width:320px}</style>${code.replace('loading="lazy"', '')}` }));
    await page.goto("http://article.test/");
    const frame = page.frameLocator("iframe");
    await expect(frame.locator(`chizu-${maker}`)).toHaveAttribute("data-ready", "true");
    const child = page.frames().find((frame) => frame.url().startsWith("http://chizu.test/embed/"));
    expect(await child.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight && document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const controls = await frame.locator(".czm-controls").evaluate((element) => {
      const stage = element.closest(".czm-stage").getBoundingClientRect();
      return [...element.querySelectorAll("button")].every((button) => { const box = button.getBoundingClientRect(); return box.width >= 44 && box.height >= 44 && box.top >= stage.top && box.bottom <= stage.bottom && box.left >= stage.left && box.right <= stage.right; });
    });
    expect(controls).toBe(true);
    await page.unroute("http://article.test/");
  }
});

test("released per-region colours and native callbacks survive the element bridge", async ({ page }) => {
  await serve(page);
  await page.goto("http://chizu.test/embed/?region=world");
  const map = page.locator("chizu-map");
  await expect(map).toHaveAttribute("data-ready", "true");
  await map.evaluate(element => {
    window.__hostSelections = [];
    window.__hostViews = [];
    element.options = { colors: { JP: "#ff0000", CA: "url(https://bad.test/fill)" }, onSelect: code => window.__hostSelections.push(code), onView: view => window.__hostViews.push(view) };
  });
  await expect(map.locator('.cz-region[data-code="JP"]').first()).toHaveAttribute("data-color", "#ff0000");
  await expect(map.locator('.cz-region[data-code="CA"]').first()).not.toHaveAttribute("data-color", /.*/);
  await map.locator("select.choose").selectOption("JP");
  expect(await page.evaluate(() => window.__hostSelections)).toEqual(["JP"]);
  expect(await page.evaluate(() => window.__hostViews.length)).toBeGreaterThan(0);
});


test("map colours and capital switches survive builder links and validated frames", async ({ page }) => {
  await serve(page);
  await page.goto("http://chizu.test/builder.html?lang=en");
  await page.locator("#opt-colors").fill("JP:#2f6b4f,GB:#8a3b3b");
  await page.locator("#opt-capital").click();
  const map = page.locator("#bld-stage chizu-map");
  await expect(map).toHaveAttribute("data-ready", "true");
  await expect(map.locator('.cz-region[data-code="JP"]').first()).toHaveAttribute("data-color", "#2f6b4f");
  await expect(map.locator('.cz-region[data-code="GB"]').first()).toHaveAttribute("data-color", "#8a3b3b");
  await expect(map.locator('[data-group="capitals"]')).toHaveCount(0);
  const link = page.url();
  await page.goto(link);
  await expect(page.locator("#opt-colors")).toHaveValue("JP:#2f6b4f,GB:#8a3b3b");
  await expect(page.locator("#opt-capital")).toHaveAttribute("aria-pressed", "false");
  await page.locator('#bld-formats [data-format="url"]').click();
  const frame = (await page.locator("#bld-code").textContent()).replace("https://johnmorrisdotca.github.io/chizu/", "http://chizu.test/");
  await page.goto(frame);
  const embedded = page.locator("chizu-map");
  await expect(embedded).toHaveAttribute("data-ready", "true");
  await expect(embedded.locator('.cz-region[data-code="JP"]').first()).toHaveAttribute("data-color", "#2f6b4f");
  await expect(embedded.locator('[data-group="capitals"]')).toHaveCount(0);
  await embedded.evaluate((element) => { element.features = "all"; element.capital = "off"; });
  await expect(embedded).toHaveAttribute("data-ready", "true");
  await expect(embedded.locator('[data-group="capitals"]')).toHaveCount(0);
  await embedded.evaluate((element) => { element.capital = true; });
  await expect(embedded.locator('[data-group="capitals"]').first()).toBeVisible();
  await page.goto("http://chizu.test/embed/?colors=JP:url(evil)&capital=invalid");
  await expect(page.locator("chizu-map")).not.toHaveAttribute("colors", /.*/);
  await expect(page.locator("chizu-map")).not.toHaveAttribute("capital", /.*/);
});

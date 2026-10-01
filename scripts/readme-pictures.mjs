// Takes the pictures the README shows, from the built demo in `site/`: `pnpm pictures` (builds the demo, then runs this).
// The page is served to a browser without a port, never fetched from the live site, and the same each run: the map and
// the mode are named by the address, the callouts are placed by the package from the map alone, and motion is reduced.
// It waits on the map's own svg, never on a clock.
// Output: docs/desktop.jpg (1280 wide, light, English) and docs/phone.jpg (390 by 844, dark, Japanese).
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const docs = join(root, "docs");
const host = "http://chizu.test";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
const QUALITY = 76;

if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm pictures` (it builds the demo first)");
const browser = await chromium.launch();

async function shot({ width, height, colorScheme, query, path, scrollTo, touch }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2, hasTouch: touch, isMobile: touch });
  const page = await context.newPage();
  await page.route(`${host}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
  await page.goto(`${host}/?${query}`);
  await page.waitForSelector('[data-testid="board"][data-ready="true"] svg.chizu .cz-callout');
  if (scrollTo) await page.locator(scrollTo).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 4));
  else await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.screenshot({ path, type: "jpeg", quality: QUALITY });
  await context.close();
}

// The world with twenty countries numbered, on a desk, from the top of the page so the header, the language chooser, the cloth patches, the choices and the map all show.
await shot({ width: 1280, height: 1560, colorScheme: "light", query: "mode=callouts&lang=en", path: join(docs, "desktop.jpg"), touch: false });
// Germany's sixteen states on a phone in dark mode and Japanese, scrolled to the map.
await shot({ width: 390, height: 844, colorScheme: "dark", query: "mode=callouts&map=divisions:de&lang=ja", path: join(docs, "phone.jpg"), scrollTo: '[data-testid="board"]', touch: true });
await browser.close();

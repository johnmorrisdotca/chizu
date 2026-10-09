// What every demo test starts from: the built demo in `site/`, served to the page without a port, and the helpers a
// test plays with.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

/** Serve `site/` to a page at http://chizu.test/. */
export async function serve(page) {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:demo` does)");
  await page.route("http://chizu.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname.endsWith("/") ? `${pathname}index.html` : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
}

/** Collect anything the page complains of. */
function listen(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  return errors;
}

export const at = (id) => `[data-testid="${id}"]`;
export const svg = (page) => page.locator(`${at("board")} svg.chizu`);
export const region = (page, code) => page.locator(`${at("board")} .cz-region[data-code="${code}"]`).first();

/** Open the demo with a query and wait until its map is drawn; returns what the page complains of. */
export async function open(page, query = "") {
  const errors = listen(page);
  await serve(page);
  await page.goto(`http://chizu.test/${query}`);
  await page.waitForSelector(`${at("board")}[data-ready="true"] svg.chizu`);
  return errors;
}

/** Nothing the demo drew sits beyond the page's own width. */
export async function noSidewaysScroll(page) {
  const [scroll, client] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(scroll).toBeLessThanOrEqual(client);
}

/** Tap, as a finger would where the page is touched and as a mouse where it is not. */
export async function tap(page, selector, testInfo) {
  const target = typeof selector === "string" ? page.locator(selector).first() : selector;
  await target.scrollIntoViewIfNeeded();
  if (testInfo.project.use.hasTouch === true) await target.tap();
  else await target.click();
}

/**
 * A point on the screen well inside a region's land, for a region whose box's middle is sea (an archipelago) or which
 * is small: a grid over its pieces, keeping the point whose surroundings land on it furthest out.
 */
export async function pointOn(page, code) {
  return page.evaluate((wanted) => {
    const hits = (x, y) => document.elementFromPoint(x, y)?.closest(".cz-region")?.dataset.code === wanted;
    const group = document.querySelector(`[data-testid="board"] .cz-region[data-code="${wanted}"]`);
    let best = null;
    for (const path of group.querySelectorAll(".cz-land")) {
      const box = path.getBoundingClientRect();
      for (let i = 1; i < 40; i += 1) {
        for (let j = 1; j < 40; j += 1) {
          const x = box.left + (box.width * i) / 40;
          const y = box.top + (box.height * j) / 40;
          if (!hits(x, y)) continue;
          let room = 0;
          while (room < 30 && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => hits(x + dx * (room + 1), y + dy * (room + 1)))) room += 1;
          if (best === null || room > best.room) best = { x, y, room };
        }
      }
    }
    return best;
  }, code);
}

/** Press a region where its land is, as a finger would on a touch screen and a mouse would on a desk. */
export async function press(page, code, testInfo) {
  await page.locator(`${at("board")}`).scrollIntoViewIfNeeded();
  const point = await pointOn(page, code);
  if (point === null) throw new Error(`no land of ${code} on the screen`);
  if (testInfo.project.use.hasTouch === true) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

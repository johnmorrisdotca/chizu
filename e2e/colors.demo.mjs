// A colour for each region (the `colors` option of drawChizu and mountChizu), drawn by the browser from the package's own built files.
import { expect, test } from "@playwright/test";

import { open } from "./demo.mjs";

/** Mount a map of Germany with the options, in a box of the page's own, and read the fill the browser gave two regions. */
const fills = (page, options) =>
  page.evaluate(async (given) => {
    const { mountChizu } = await import("/dist/mount-entry.js");
    const { loadDivisions } = await import("/dist/load-entry.js");
    const host = document.createElement("div");
    host.style.width = "400px";
    document.body.append(host);
    mountChizu(host, { map: await loadDivisions("de"), controls: false, ...given });
    const fill = (code) => getComputedStyle(host.querySelector(`.cz-region[data-code="${code}"] .cz-land`)).fill;
    const result = { by: fill("BY"), nw: fill("NW"), be: fill("BE"), attribute: host.querySelector('.cz-region[data-code="BY"]').getAttribute("data-color") };
    host.remove();
    return result;
  }, options);

test("two regions told apart by two colours, and a region with none is drawn as the land", async ({ page }) => {
  const errors = await open(page);
  const plain = await fills(page, {});
  const coloured = await fills(page, { colors: { BY: "#2f6b4f", NW: "rgb(138, 59, 59)" } });
  expect(coloured.by).toBe("rgb(47, 107, 79)");
  expect(coloured.nw).toBe("rgb(138, 59, 59)");
  expect(coloured.by).not.toBe(coloured.nw);
  expect(coloured.be).toBe(plain.be);
  expect(plain.attribute).toBeNull();
  expect(errors).toEqual([]);
});

test("a colour wins over a tone's fill, and a value that is no colour is not drawn", async ({ page }) => {
  await open(page);
  const toned = await fills(page, { tones: { BY: "correct" }, colors: { BY: "#112233" } });
  expect(toned.by).toBe("rgb(17, 34, 51)");
  const refused = await fills(page, { colors: { BY: 'red" onclick="x', NW: "red;fill:blue" } });
  expect(refused.attribute).toBeNull();
  expect(refused.by).toBe((await fills(page, {})).by);
});

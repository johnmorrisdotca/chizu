// Colouring the map from pasted figures: a line a place, matched by code, ISO code or name, in five steps.
import { expect, test } from "@playwright/test";

import { at, noSidewaysScroll, open, region } from "./demo.mjs";

test("pasted figures shade the places they name, by code, ISO code or name in either language, and say what matched nothing", async ({ page }) => {
  const errors = await open(page, "?mode=colour");
  await expect(page.locator(at("colour-count"))).toHaveText("Nothing to colour yet.");
  await page.locator(at("figures")).fill(["JP-13, 14047594", "Osaka\t8837685", "愛知県, 7542415", "1, 5224614", "Atlantis, 3", "Kyoto"].join("\n"));
  await expect(page.locator(at("colour-count"))).toHaveText("4 of 6 lines matched a place.");
  await expect(page.locator(at("colour-missing"))).toContainText("Atlantis");
  await expect(region(page, "13")).toHaveClass(/cz-tone-step\d/);
  await expect(region(page, "27")).toHaveClass(/cz-tone-step\d/);
  await expect(region(page, "1")).toHaveClass(/cz-tone-step1/);
  await expect(region(page, "13")).toHaveClass(/cz-tone-step[45]/);
  await expect(region(page, "47")).not.toHaveClass(/cz-tone-step/);
  await expect(page.locator(`${at("colour-legend")} li`)).toHaveCount(4);
  await noSidewaysScroll(page);
  expect(errors).toEqual([]);
});

test("the example colours every prefecture from the map's own count of neighbours, and the step colours follow light and dark", async ({ page }) => {
  for (const scheme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: scheme });
    await open(page, "?mode=colour");
    await page.locator(at("colour-example")).click();
    await expect(page.locator(at("colour-count"))).toHaveText("47 of 47 lines matched a place.");
    const fill = await region(page, "13").locator(".cz-land").first().evaluate((node) => getComputedStyle(node).fill);
    expect(fill).not.toBe(scheme === "dark" ? "rgb(74, 74, 61)" : "rgb(233, 225, 200)");
  }
});

test("the coloured map and the matched figures download as SVG, PNG, CSV, JSON and text", async ({ page }) => {
  await open(page, "?mode=colour");
  await page.locator(at("colour-example")).click();
  const read = async (format) => {
    const waiting = page.waitForEvent("download");
    await page.locator(at(format.startsWith("map-") ? `download-coloured-${format.slice(4)}` : `download-figures-${format}`)).click();
    const file = await waiting;
    const chunks = await (await file.createReadStream()).toArray();
    return { name: file.suggestedFilename(), body: Buffer.concat(chunks) };
  };
  const svg = await read("map-svg");
  expect(svg.name).toBe("chizu-divisions-jp-coloured.svg");
  expect(svg.body.toString("utf8")).toContain("cz-tone-step");
  expect(svg.body.toString("utf8")).toContain(".cz-tone-step1 .cz-land { fill:");
  const png = await read("map-png");
  expect(png.body.subarray(1, 4).toString("ascii")).toBe("PNG");
  const csv = await read("csv");
  expect(csv.body.toString("utf8").split("\n")[0]).toBe("code,iso,name,nameJa,value,step");
  const json = JSON.parse((await read("json")).body.toString("utf8"));
  expect(json.rows).toHaveLength(47);
  expect((await read("txt")).body.toString("utf8")).toContain("Japan");
});

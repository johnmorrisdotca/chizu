// The code for the map as it is: it follows the map, the part, the mode and the language, and copies.
import { expect, test } from "@playwright/test";

import { at, open } from "./demo.mjs";

test("the code loads the map in view and mounts it, and follows the part and the callouts", async ({ page }) => {
  await open(page);
  const code = page.locator(at("code"));
  await expect(code).toContainText('await loadDivisions("jp")');
  await expect(code).toContainText("mountChizu(document.querySelector(\"#map\")");
  await expect(code).toContainText('language: "en"');
  await page.locator(at("part")).selectOption("Kanto");
  await expect(code).toContainText('const part = ["8","9","10","11","12","13","14"]');
  await expect(code).toContainText("mount.show(part)");
  await page.locator(`${at("modes")} button[data-value="callouts"]`).click();
  await expect(code).toContainText("callouts:");
  await page.locator(`${at("code-kind")} button[data-value="draw"]`).click();
  await expect(code).toContainText("drawChizu(map, {");
  await expect(code).toContainText("box: groupBox(map, part, 4 / 3)");
  await open(page, "?map=world&lang=ja");
  await expect(code).toContainText('import WORLD from "@johnmorrisdotca/chizu/world"');
  await expect(code).toContainText('language: "ja"');
});

test("the code runs: drawn with the package it names, it makes the map", async ({ page }) => {
  await open(page, "?part=Shikoku");
  await page.locator(`${at("code-kind")} button[data-value="draw"]`).click();
  const code = await page.locator(at("code")).textContent();
  const svg = await page.evaluate(async (source) => {
    // The demo's own map chooser is #map too: it steps aside, as a reader's page would not have one.
    document.getElementById("map").id = "map-chooser";
    const host = document.createElement("div");
    host.id = "map";
    document.body.append(host);
    const runnable = source.replace(/from "@johnmorrisdotca\/chizu\/(\w+)"/g, (_, entry) => `from "${location.origin}/dist/${entry === "world" ? "world-entry" : `${entry}-entry`}.js"`).replace(/from "@johnmorrisdotca\/chizu"/g, `from "${location.origin}/dist/index.js"`);
    const url = URL.createObjectURL(new Blob([runnable], { type: "text/javascript" }));
    await import(url);
    return host.innerHTML.slice(0, 200);
  }, code);
  expect(svg.startsWith("<svg")).toBe(true);
});

test("the copy button copies the code, and says so", async ({ page }) => {
  await open(page);
  await page.locator(at("copy-code")).click();
  await expect(page.locator(at("copy-code"))).toHaveText("Copied");
});

import { describe, expect, it } from "vitest";
import WORLD from "./data/world.data.ts";
import { loadCountry, loadDivisions, loadWorldDetail } from "./load-entry.ts";
import type { ChizuMap } from "./types.ts";
import { CHIZU_VIEWS, loadView, withView } from "./views-entry.ts";

const pieces = (path: string) => path.split("M").length - 1;
const region = (map: ChizuMap, code: string) => map.regions.find((one) => one.code === code)!;

describe("the points of view", () => {
  it("are listed with their names and notes in English and Japanese, and the maps each changes", () => {
    expect(CHIZU_VIEWS.map((view) => view.id)).toEqual(["jpn", "ukr"]);
    for (const view of CHIZU_VIEWS) {
      expect(view.name).toMatch(/point of view/);
      expect(view.nameJa).toMatch(/立場/);
      expect(view.note.length).toBeGreaterThan(40);
      expect(view.noteJa.length).toBeGreaterThan(20);
    }
    expect(CHIZU_VIEWS.find((view) => view.id === "ukr")!.maps).toEqual([
      "world",
      "world-detail",
      "country-ua",
      "country-ru",
      "divisions-ru",
    ]);
    expect(CHIZU_VIEWS.find((view) => view.id === "jpn")!.maps).toEqual(["world-detail", "country-jp", "country-ru"]);
  });

  it("are loaded by id, and an id that is not one is refused", async () => {
    expect((await loadView("ukr")).id).toBe("ukr");
    // @ts-expect-error not a view
    await expect(loadView("xyz")).rejects.toThrow(/no point of view xyz/);
  });

  it("leave a map as it is when there is no view, or the view does not change it", async () => {
    expect(withView(WORLD, null)).toBe(WORLD);
    expect(withView(WORLD, undefined)).toBe(WORLD);
    // Japan's Northern Territories are too small for the 1:110m world, and the view does not claim to change it.
    expect(withView(WORLD, await loadView("jpn"))).toBe(WORLD);
    const france = (await loadCountry("fr"))!;
    expect(withView(france, await loadView("ukr"))).toBe(france);
  });

  it("put Crimea in Ukraine on the world and take it out of Russia, nothing else changing", async () => {
    const ukraine = withView(WORLD, await loadView("ukr"));
    expect(ukraine).not.toBe(WORLD);
    expect(ukraine.id).toBe("world");
    expect(ukraine.regions.map((one) => one.code)).toEqual(WORLD.regions.map((one) => one.code));
    const changed = ukraine.regions.filter((one, index) => one !== WORLD.regions[index]).map((one) => one.code);
    expect(changed).toEqual(expect.arrayContaining(["RU", "UA"]));
    expect(changed).toHaveLength(2);
    // Crimea reaches further south than the mainland of Ukraine does, so the box of Ukraine is taller; Russia gives up a piece
    expect(region(ukraine, "UA").bbox[3]).toBeGreaterThan(region(WORLD, "UA").bbox[3]);
    expect(region(ukraine, "UA").bbox.slice(0, 3)).toEqual(region(WORLD, "UA").bbox.slice(0, 3));
    expect(pieces(region(ukraine, "RU").path)).toBe(pieces(region(WORLD, "RU").path) - 1);
    expect(region(ukraine, "UA").neighbors).toEqual(region(WORLD, "UA").neighbors);
    expect(ukraine.source).toMatch(/Ukraine's point of view/);
    expect(WORLD.source).not.toMatch(/point of view/);
  });

  it("draw the finer world and Ukraine's own map the same way, with the canvas of Ukraine's grown to hold Crimea", async () => {
    const view = await loadView("ukr");
    const detail = (await loadWorldDetail()) as ChizuMap;
    const finer = withView(detail, view);
    expect(pieces(region(finer, "RU").path)).toBe(pieces(region(detail, "RU").path) - 1);
    expect(region(finer, "UA").bbox[3]).toBeGreaterThan(region(detail, "UA").bbox[3]);
    const alone = (await loadCountry("ua"))!;
    const seen = withView(alone, view);
    expect(seen.height).toBeGreaterThan(alone.height);
    expect(seen.width).toBe(alone.width);
    expect(seen.viewBox).toBe(`0 0 ${seen.width} ${seen.height}`);
    expect(seen.regions).toHaveLength(1);
    expect(seen.regions[0]!.path).not.toBe(alone.regions[0]!.path);
    const russia = withView((await loadCountry("ru"))!, view);
    expect(pieces(russia.regions[0]!.path)).toBe(pieces((await loadCountry("ru"))!.regions[0]!.path) - 1);
  });

  it("take Crimea and Sevastopol off the map of Russia's regions, and out of the neighbours of the others", async () => {
    const regions = (await loadDivisions("ru"))!;
    expect(regions.regions.map((one) => one.code)).toEqual(expect.arrayContaining(["UA-40", "UA-43"]));
    const seen = withView(regions, await loadView("ukr"));
    expect(seen.regions).toHaveLength(regions.regions.length - 2);
    expect(seen.regions.some((one) => ["UA-40", "UA-43"].includes(one.code))).toBe(false);
    expect(seen.regions.some((one) => one.neighbors.some((code) => ["UA-40", "UA-43"].includes(code)))).toBe(false);
    // what it did not take is the same region, not a copy
    expect(seen.regions.find((one) => one.code === "RU-MOS")).toBe(
      regions.regions.find((one) => one.code === "RU-MOS"),
    );
    expect(regions.regions.some((one) => one.neighbors.some((code) => ["UA-40", "UA-43"].includes(code)))).toBe(true);
  });

  it("put the Northern Territories in Japan on the finer world and on Japan's own map, three islands of Russia's less", async () => {
    const view = await loadView("jpn");
    const detail = (await loadWorldDetail()) as ChizuMap;
    const finer = withView(detail, view);
    expect(pieces(region(finer, "JP").path)).toBe(pieces(region(detail, "JP").path) + 3);
    expect(pieces(region(finer, "RU").path)).toBe(pieces(region(detail, "RU").path) - 3);
    const japan = (await loadCountry("jp"))!;
    const seen = withView(japan, view);
    expect(pieces(seen.regions[0]!.path)).toBe(pieces(japan.regions[0]!.path) + 3);
    // the Kurils reach north-east of Hokkaido: the canvas of Japan is wider
    expect(seen.width).toBeGreaterThan(japan.width);
    // Japan's regions are unchanged: the prefectures are Natural Earth's own
    const prefectures = (await loadDivisions("jp"))!;
    expect(withView(prefectures, view)).toBe(prefectures);
  });

  it("change nothing in the data they are given", async () => {
    const before = JSON.stringify(WORLD);
    withView(WORLD, await loadView("ukr"));
    expect(JSON.stringify(WORLD)).toBe(before);
  });
});

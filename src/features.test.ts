import { describe, expect, it } from "vitest";

import { drawChizu } from "./draw.ts";
import { FEATURE_LOADERS } from "./data/loaders.ts";
import world from "./data/world.ts";
import { CHIZU_FEATURE_GROUPS, CHIZU_FEATURE_KINDS, featureChosen, featureMap, featuresShown, findFeatures } from "./features.ts";
import { focusRegionFit } from "./frame.ts";
import { placesFromText } from "./fromText.ts";
import { layoutCallouts } from "./layout.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
import { featureKindName, featureKindOf } from "./strings.ts";
import type { ChizuFeatureLayer, ChizuMap } from "./types.ts";

const layerOf = async (id: string): Promise<ChizuFeatureLayer> => (await FEATURE_LOADERS[id]!()).default;
const mapOf = async (id: string): Promise<ChizuMap> => {
  const [kind, code] = id.split("-");
  return (await import(`./data/${kind === "divisions" ? "divisions" : "countries"}/${code}.ts`)).default;
};

describe("the features' data", () => {
  it("is one file a map, every feature named, coded once, of a known kind and on its canvas", async () => {
    const ids = Object.keys(FEATURE_LOADERS);
    expect(ids.length).toBeGreaterThan(200);
    for (const id of ids) {
      const layer = await layerOf(id);
      expect(layer.map).toBe(id);
      const map = id === "world" ? world : await mapOf(id);
      const codes = new Set<string>();
      for (const feature of layer.features) {
        expect(codes.has(feature.code), `${id} ${feature.code} twice`).toBe(false);
        codes.add(feature.code);
        expect(feature.code).toMatch(/^(Q\d+|ne-\d+|ne-river-\d+|capital-[A-Z]{2}|seat-[A-Z]{2}-[0-9A-Z]+)$/);
        expect(CHIZU_FEATURE_KINDS[feature.group], `${id} ${feature.code}`).toContain(feature.kind);
        expect(feature.name.trim().length, `${id} ${feature.code}`).toBeGreaterThan(0);
        if (feature.group === "peaks" || feature.group === "capitals") expect(feature.path).toBe("");
        else if (feature.group === "rivers") expect(feature.path, `${id} ${feature.code}`).toMatch(/^M[^Z]+$/);
        else expect(feature.path, `${id} ${feature.code}`).toMatch(/^M.*Z$/);
        const [x0, y0, x1, y1] = feature.bbox;
        // Cut to the canvas, a unit of slack either side.
        expect(x0 >= -1.5 && y0 >= -1.5 && x1 <= map.width + 1.5 && y1 <= map.height + 1.5, `${id} ${feature.code} ${feature.bbox}`).toBe(true);
        for (const near of feature.neighbors) expect(layer.features.some((other) => other.code === near), `${id} ${feature.code} → ${near}`).toBe(true);
      }
    }
  }, 120_000);

  it("gives the world the great water, each once though Natural Earth draws the Pacific and the Atlantic in halves", async () => {
    const layer = await layerOf("world");
    const named = (name: string) => layer.features.filter((feature) => feature.name === name);
    for (const name of ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Caspian Sea", "Mediterranean Sea", "Sea of Japan", "Lake Superior", "Lake Victoria", "Nile", "Amazon River", "Yangtze River", "Mississippi River"]) expect(named(name), name).toHaveLength(1);
    expect(named("Caspian Sea")[0]).toMatchObject({ code: "Q5484", kind: "sea", nameJa: "カスピ海", reading: "かすぴかい" });
    expect(named("Pacific Ocean")[0]).toMatchObject({ code: "Q98", kind: "ocean", nameJa: "太平洋", reading: "たいへいよう" });
    for (const group of CHIZU_FEATURE_GROUPS) expect(layer.features.some((feature) => feature.group === group), group).toBe(true);
  });

  it("gives Japan's prefectures the seas on their coasts and the lakes and rivers on their land, named and read", async () => {
    const layer = await layerOf("divisions-jp");
    const byName = Object.fromEntries(layer.features.map((feature) => [feature.name, feature]));
    for (const [name, nameJa, reading] of [
      ["Sea of Japan", "日本海", "にほんかい"],
      ["Seto Inland Sea", "瀬戸内海", "せとないかい"],
      ["Lake Biwa", "琵琶湖", "びわこ"],
      ["Ishikari River", "石狩川", "いしかりがわ"],
      ["Tone River", "利根川", "とねがわ"],
      ["Tsugaru Strait", "津軽海峡", "つがるかいきょう"],
      ["Mount Fuji", "富士山", "ふじさん"],
    ]) expect(byName[name!], name).toMatchObject({ nameJa, reading });
    // Nothing of a neighbour's land: no Korean river, no Chinese lake.
    expect(layer.features.some((feature) => ["Han River", "Nakdong River", "Lake Khanka"].includes(feature.name))).toBe(false);
    // The Sea of Japan's name is not written over the boxes the map draws Okinawa in.
    const japan = await mapOf("divisions-jp");
    const [x, y] = byName["Sea of Japan"]!.centroid;
    for (const inset of japan.insets) expect(x > inset.box.x && x < inset.box.x + inset.box.width && y > inset.box.y && y < inset.box.y + inset.box.height).toBe(false);
  });

  it("marks a country's capital on its maps and the world, and on Japan's prefectures each one's seat, Naha in Okinawa's box", async () => {
    const japan = await layerOf("divisions-jp");
    const capital = japan.features.find((feature) => feature.code === "capital-JP")!;
    expect(capital).toMatchObject({ kind: "capital", name: "Tokyo", nameJa: "東京", reading: "とうきょう" });
    // Tokyo's seat is Shinjuku, which the capital's mark stands for.
    expect(japan.features.filter((feature) => feature.kind === "seat")).toHaveLength(46);
    const naha = japan.features.find((feature) => feature.code === "seat-JP-47")!;
    expect(naha).toMatchObject({ name: "Naha", nameJa: "那覇市", reading: "なはし" });
    const map = await mapOf("divisions-jp");
    const box = map.insets.find((inset) => inset.code === "47")!.box;
    expect(naha.centroid[0] > box.x && naha.centroid[0] < box.x + box.width && naha.centroid[1] > box.y && naha.centroid[1] < box.y + box.height).toBe(true);
    const world = await layerOf("world");
    expect(world.features.find((feature) => feature.code === "capital-FR")).toMatchObject({ name: "Paris", nameJa: "パリ" });
    expect(world.features.filter((feature) => feature.kind === "seat")).toEqual([]);
  });

  it("joins the water that touches: a sea's neighbouring seas", async () => {
    const layer = await layerOf("divisions-jp");
    const okhotsk = layer.features.find((feature) => feature.name === "Sea of Okhotsk")!;
    expect(okhotsk.neighbors).toContain("Q98");
  });

  it("keeps a landlocked country's water to its own lakes and rivers", async () => {
    const layer = await layerOf("divisions-ch");
    expect(layer.features.some((feature) => feature.group === "marine")).toBe(false);
    expect(layer.features.some((feature) => feature.name === "Lake Geneva")).toBe(true);
  });
});

describe("the features in the engine", () => {
  it("shows what was chosen: the water, a group, a kind, or everything", () => {
    const sea = { kind: "sea", group: "marine" } as const;
    const peak = { kind: "peak", group: "peaks" } as const;
    expect([featureChosen(sea, ["water"]), featureChosen(peak, ["water"]), featureChosen(peak, ["all"]), featureChosen(sea, ["strait"]), featureChosen(sea, [])]).toEqual([true, false, true, false, false]);
    expect(featuresShown(null, ["water"])).toEqual([]);
  });

  it("finds a feature by its English, its Japanese or its reading, the closest match first", async () => {
    const layer = await layerOf("world");
    for (const typed of ["caspian", "Caspian Sea", "カスピ", "かすぴかい", "q5484"]) expect(findFeatures(layer.features, typed)[0]?.code, typed).toBe("Q5484");
    expect(findFeatures(layer.features, "")).toEqual([]);
    expect(findFeatures(layer.features, "sea", { limit: 3 })).toHaveLength(3);
  });

  it("makes a layer a map the engine takes: framed, asked about, read from a paste", async () => {
    const water = featureMap(world, await layerOf("world"), ["water"]);
    expect(water.id).toBe("world-features");
    expect(water.regions.every((region) => ["marine", "lakes", "rivers"].includes(region.group))).toBe(true);
    const question = findQuestion(water, "Q5484", seededRandom(3))!;
    expect(question.choices).toHaveLength(4);
    expect(question.choices[question.answerIndex]).toBe("Q5484");
    expect(focusRegionFit(water, "Q5484")?.zoom).toBeGreaterThan(1);
    expect(placesFromText("Caspian Sea, 太平洋, Atlantis", water.regions)).toEqual({ codes: ["Q5484", "Q98"], missing: ["Atlantis"] });
  });

  it("numbers features in callouts, from where their names go", async () => {
    const layer = await layerOf("world");
    const spots = layoutCallouts(world, { codes: ["JP", "Q5484", "Q98"], features: layer.features });
    expect(spots.map((spot) => spot.code)).toEqual(["JP", "Q5484", "Q98"]);
    const caspian = layer.features.find((feature) => feature.code === "Q5484")!.centroid;
    expect(spots[1]!.start[0]).toBeCloseTo(caspian[0], 6);
    expect(spots[1]!.start[1]).toBeCloseTo(caspian[1], 6);
  });

  it("names each kind in both languages", () => {
    for (const kinds of Object.values(CHIZU_FEATURE_KINDS)) {
      for (const kind of kinds) {
        expect(featureKindName(kind, "en"), kind).not.toContain("kind.");
        expect(featureKindName(kind, "ja"), kind).not.toContain("kind.");
      }
    }
  });
});

describe("the features in a drawing", () => {
  it("leaves a map without them as it always was", async () => {
    const layer = await layerOf("world");
    expect(drawChizu(world, { featureLayer: layer })).toBe(drawChizu(world));
    expect(drawChizu(world, { features: ["water"] })).toBe(drawChizu(world));
  });

  it("draws the seas under the land and the rest on it, a river by its rank, the names italic and placed apart", async () => {
    const layer = await layerOf("world");
    const svg = drawChizu(world, { features: ["all"], featureLayer: layer, interactive: true });
    expect(svg.indexOf('data-group="marine"')).toBeLessThan(svg.indexOf('class="cz-land-copy"'));
    expect(svg.indexOf('data-group="rivers"')).toBeGreaterThan(svg.indexOf('class="cz-land-copy"'));
    expect(svg).toMatch(/<path class="cz-river" d="M[^"]+" stroke-width="2.4"\/>/);
    expect(svg).toContain('aria-label="Caspian Sea, Sea"');
    expect(svg).toContain('class="cz-feature-label cz-water-label cz-sea-label"');
    // A feature from another map's layer is never drawn on this one.
    expect(drawChizu(world, { features: ["all"], featureLayer: { ...layer, map: "divisions-jp" } })).toBe(drawChizu(world));
  });

  it("draws a toned feature whose group is off, and puts no names on the water when asked for none", async () => {
    const layer = await layerOf("divisions-jp");
    const japan = await mapOf("divisions-jp");
    const svg = drawChizu(japan, { featureLayer: layer, tones: { Q200239: "selected" }, language: "ja" });
    expect(svg).toContain('data-code="Q200239" data-kind="lake" data-group="lakes" data-tone="selected"');
    expect(svg.match(/class="cz-feature /g)).toHaveLength(1);
    expect(svg).toContain(">琵琶湖</text>");
    // The boxes Okinawa is drawn in are given the plain sea again over the Sea of Japan.
    expect(drawChizu(japan, { features: ["marine"], featureLayer: layer, featureLabels: false })).toContain('class="cz-inset-sea"');
    expect(drawChizu(japan, { features: ["marine"], featureLayer: layer, featureLabels: false })).not.toContain("cz-feature-label");
  });
});

describe("the seats of regions drawn whole in boxes of their own", () => {
  it("puts Juneau in Alaska's box and Honolulu in Hawaii's, and every other state's seat on the map", async () => {
    const layer = await layerOf("divisions-us");
    const us = await mapOf("divisions-us");
    const seats = layer.features.filter((feature) => feature.kind === "seat");
    expect(seats).toHaveLength(50);
    for (const [code, name] of [["AK", "Juneau"], ["HI", "Honolulu"]] as const) {
      const seat = seats.find((feature) => feature.code === `seat-US-${code}`)!;
      const box = us.insets.find((inset) => inset.code === code)!.box;
      expect(seat.name).toBe(name);
      const [x, y] = seat.centroid;
      expect(x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height, `${name} ${seat.centroid} in ${JSON.stringify(box)}`).toBe(true);
    }
  });
});

describe("what a feature's kind is called on a map", () => {
  it("calls a region's seat 県庁所在地 on a map of Japan and 行政の中心地 elsewhere", () => {
    expect(featureKindOf({ kind: "seat", code: "seat-JP-47" }, "ja")).toBe("県庁所在地");
    expect(featureKindOf({ kind: "seat", code: "seat-JP-47" }, "en")).toBe("Prefectural capital");
    expect(featureKindOf({ kind: "seat", code: "seat-US-TX" }, "ja")).toBe("行政の中心地");
    expect(featureKindOf({ kind: "seat", code: "seat-US-TX" }, "en")).toBe("Seat of government");
    expect(featureKindOf({ kind: "capital", code: "capital-JP" }, "ja")).toBe("首都");
    expect(featureKindOf({ kind: "lake", code: "Q200239" }, "en")).toBe("Lake");
  });

  it("is what a screen reader hears of a seat in the drawing", async () => {
    const layer = await layerOf("divisions-jp");
    const japan = await mapOf("divisions-jp");
    const svg = drawChizu(japan, { features: ["capitals"], featureLayer: layer, interactive: true, language: "ja" });
    expect(svg).toContain('aria-label="那覇市（県庁所在地）"');
  });
});

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { coordinatesOf } from "../build-data.mjs";
import { NATURAL_EARTH } from "../data-config.mjs";
import { featureReferenceDoc, mapReferenceDoc } from "../data-docs.mjs";
import { root } from "../natural-earth.mjs";

export const out = join(root, "src", "data");
const PRECISION = 2;
export const WORLD_WIDTH = 1000;
/** 155°E in the middle: the Pacific whole, Japan at the centre, the seam west of Iceland, as a Japanese classroom's wall map draws it. */
export const CENTRE_LONGITUDE = 155;
/** A country alone is drawn on a canvas whose longer side is this. */
export const COUNTRY_SIDE = 1000;
/** How far from a country's largest piece (in degrees of the earth's surface) another piece may lie and still be drawn on its own map. */
export const NEAR_DEGREES = 9;
/** A country smaller than this (in square kilometres) is drawn from the 1:10m file: at 1:50m Singapore and Malta are hexagons. */
export const SMALL_KM2 = 60000;
export const EARTH_RADIUS_KM = 6371;
export const CONTINENTS = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania", "Antarctica"];

export const round = (value) => Math.round(value * 10 ** PRECISION) / 10 ** PRECISION;
/*
 * The numbers a map keeps about its projection (to put a longitude and latitude on it) are rounded, because the last
 * digits of a fitted scale are not the same on every machine: a computer's trigonometry differs by a part in 10^12,
 * and `pnpm data` must write the same bytes on a Mac and on the CI runner. The paths are not affected (they are
 * rounded to two decimals from the exact projection, and are the same on both), and a rounded scale places a point
 * to a ten-thousandth of a unit.
 */
export const fixed = (digits) => (value) => Math.round(value * 10 ** digits) / 10 ** digits;
export const keepScale = fixed(2);
export const keepTranslate = fixed(3);
export const keepDegrees = fixed(6);

/**
 * A path as the engine wants it: `M x,y L x,y … Z` a piece, coordinates to two decimals, a point that rounding left on
 * top of the one before it taken out, and a piece with fewer than three corners left out.
 */
function tidy(d) {
  const pieces = [];
  for (const part of d.split(/(?=M)/)) {
    const numbers = part.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)?.map(Number) ?? [];
    const points = [];
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const x = round(numbers[i]);
      const y = round(numbers[i + 1]);
      const last = points.at(-1);
      if (last !== undefined && last[0] === x && last[1] === y) continue;
      points.push([x, y]);
    }
    if (points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]) points.pop();
    if (points.length < 3) continue;
    pieces.push(`M${points.map(([x, y]) => `${x},${y}`).join("L")}Z`);
  }
  return pieces.join("");
}

/** Two regions are neighbours when their outlines share a point (to three decimals of a degree). */
export function neighboursBySharedPoints(features, codeOf) {
  const owners = new Map();
  features.forEach((feature, index) => {
    for (const [x, y] of coordinatesOf(feature.geometry)) {
      const key = `${x.toFixed(3)},${y.toFixed(3)}`;
      const held = owners.get(key);
      if (held === undefined) owners.set(key, new Set([index]));
      else held.add(index);
    }
  });
  const touching = features.map(() => new Set());
  for (const held of owners.values()) {
    if (held.size < 2) continue;
    for (const a of held) for (const b of held) if (a !== b) touching[a].add(b);
  }
  return touching.map((set) => [...set].map((index) => codeOf(features[index])).sort());
}

/** The shape of one region as the data holds it. */
export function regionOf(draw, feature, fields) {
  const d = draw(feature);
  if (!d) throw new Error(`no path for ${fields.name}`);
  const [[minX, minY], [maxX, maxY]] = draw.bounds(feature);
  const [cx, cy] = draw.centroid(feature);
  return {
    ...fields,
    path: tidy(d),
    bbox: [round(minX), round(minY), round(maxX), round(maxY)],
    centroid: [round(cx), round(cy)],
  };
}

export const literal = (value) => JSON.stringify(value);

/** A data module: one map, exported as the default. */
export function writeMap(path, header, map, doc = "") {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * ${header}
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "${"../".repeat(path.slice(out.length + 1).split("/").length)}types.ts";

${doc || mapReferenceDoc(path.slice(out.length + 1).replace(/\.data\.ts$|\.ts$/, ""), header, map)}const map: ChizuMap = ${literal(map)};

export default map;
`,
  );
}

/** A data module of one map's features, exported as the default. */
export function writeFeatures(path, map, features) {
  mkdirSync(dirname(path), { recursive: true });
  const count = (group) => features.filter((feature) => feature.group === group).length;
  const layer = {
    map: map.id,
    source: `Natural Earth ${NATURAL_EARTH.version} physical vectors, 1:10m, on the canvas of ${map.id}; names from Natural Earth and Wikidata`,
    features,
  };
  writeFileSync(
    path,
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * The named features of ${map.name} (${map.id}): ${count("marine")} seas, ${count("lakes")} lakes, ${count("rivers")} rivers, ${count("landforms")} landforms, ${count("peaks")} peaks, ${count("capitals")} capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

${featureReferenceDoc(path.slice(out.length + 1).replace(/\.data\.ts$|\.ts$/, ""), layer)}const layer: ChizuFeatureLayer = ${literal(layer)};

export default layer;
`,
  );
}

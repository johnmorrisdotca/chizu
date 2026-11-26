// The points of view (MODULES-1614): for each view in VIEWS, the pieces of one country's default outline that belong to
// another's in it, moved at 1:110m, 1:50m and on the country maps, and written as `src/data/views/<id>.data.ts`. See
// scripts/data-config/views.mjs for how a point-of-view file is used and why only as a ruler.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { geoArea, geoCentroid, geoContains, geoPath } from "d3-geo";
import { isoOf, polygonsOf } from "../build-data.mjs";
import { NATURAL_EARTH, VIEW_FILES, VIEWS } from "../data-config.mjs";
import { source } from "../natural-earth.mjs";
import { union } from "./dissolve.mjs";
import { buildCountry, corePieces } from "./divisions.mjs";
import { literal, out, regionOf, SMALL_KM2 } from "./geometry.mjs";
import { countriesFrom, projections } from "./world.mjs";

const EARTH_KM2 = 6371 ** 2;
const polygon = (rings) => ({ type: "Polygon", coordinates: rings });
const multi = (polygons) => ({ type: "MultiPolygon", coordinates: polygons });

/** The indexes of the pieces of `feature` whose centre lies inside `target` (a geometry of the point-of-view file). */
function leaving(feature, target) {
  const holds = polygonsOf(target).map(polygon);
  return polygonsOf(feature.geometry).flatMap((rings, index) =>
    holds.some((hold) => geoContains(hold, geoCentroid(polygon(rings)))) ? [index] : [],
  );
}

/** `to`'s outline with the pieces that came to it, joined to it along the line they share, if they share one. */
function joined(to, moved) {
  const whole = union([to.geometry, multi(moved)]);
  const sum = geoArea(to.geometry) + moved.reduce((total, rings) => total + geoArea(polygon(rings)), 0);
  if (Math.abs(geoArea(whole) - sum) > sum * 1e-9)
    throw new Error(`the pieces joined to ${to.properties.__code} lost area`);
  return whole;
}

/**
 * At one scale: the two countries as a view draws them, and the pieces that moved; null where none of them is there to
 * move. A count other than the view's own stops the build.
 */
function applied(features, view, scale, target) {
  const find = (code) => features.find((feature) => feature.properties.__code === code);
  const from = find(view.from);
  const to = find(view.to);
  const polygons = polygonsOf(from.geometry);
  const gone = leaving(from, target);
  if (gone.length !== view.pieces[scale])
    throw new Error(
      `${view.from} has ${gone.length} pieces at ${scale} that belong to ${view.to}, not ${view.pieces[scale]}`,
    );
  if (gone.length === 0) return null;
  const moved = gone.map((index) => polygons[index]);
  const stay = polygons.filter((_, index) => !gone.includes(index));
  return {
    moved,
    stay,
    from: { ...from, geometry: multi(stay) },
    to: { ...to, geometry: joined(to, moved) },
  };
}

/** A region drawn again on a canvas, everything else about it as it was. */
function redrawn(draw, region, feature) {
  const { path, bbox, centroid } = regionOf(draw, feature, { name: region.name });
  return { ...region, path, bbox, centroid };
}

/** The maps the view changes, by id: the world, the finer world, the two countries' own maps and the regions maps that lose a region. */
export async function buildViews({ worldSource, countriesSource, maps }) {
  const files = await Promise.all(
    Object.values(VIEWS).map(async (view) => [view.file, await source(view.file, VIEW_FILES)]),
  );
  const found = new Map(files);
  const byId = new Map(maps.map((map) => [map.id, map]));
  const regionsOf = (map, code) => map.regions.find((region) => region.code === code);
  const views = {};
  for (const [id, view] of Object.entries(VIEWS)) {
    const target = found.get(view.file).features.find((feature) => isoOf(feature.properties) === view.to).geometry;
    const changes = {};
    // The world on its own canvas, from 1:110m and from 1:50m: the two countries' regions drawn again.
    for (const [scale, input, mapId] of [
      ["110m", worldSource, "world"],
      ["50m", countriesSource, "world-detail"],
    ]) {
      const features = countriesFrom(input);
      const change = applied(features, view, scale, target);
      if (!change) continue;
      const map = byId.get(mapId);
      const draw = geoPath(projections.get("world"));
      changes[mapId] = {
        regions: [
          redrawn(draw, regionsOf(map, view.to), change.to),
          redrawn(draw, regionsOf(map, view.from), change.from),
        ].sort((a, b) => a.code.localeCompare(b.code)),
      };
    }
    // Each country alone, from 1:50m. The country the pieces join is drawn again to fit them; the one they leave keeps its canvas.
    const features = countriesFrom(countriesSource);
    const change = applied(features, view, "50m", target);
    if (change) {
      for (const code of [view.from, view.to])
        if (geoArea(features.find((feature) => feature.properties.__code === code)) * EARTH_KM2 < SMALL_KM2)
          throw new Error(`${code} is drawn from 1:10m on its own map: the view has not been written for that`);
      const toId = `country-${view.to.toLowerCase()}`;
      const fromId = `country-${view.from.toLowerCase()}`;
      const kept = projections.get(toId);
      const {
        id: _id,
        source: _source,
        ...whole
      } = buildCountry(change.to, regionsOf(byId.get(toId), view.to).neighbors, new Map());
      projections.set(toId, kept);
      changes[toId] = whole;
      const fromMap = byId.get(fromId);
      const original = features.find((feature) => feature.properties.__code === view.from);
      const shown = corePieces(original.geometry).filter((piece) => !change.moved.includes(piece));
      changes[fromId] = {
        regions: [
          redrawn(geoPath(projections.get(fromId)), regionsOf(fromMap, view.from), {
            ...original,
            geometry: multi(shown),
          }),
        ],
      };
    }
    for (const [mapId, codes] of Object.entries(view.removeFrom)) {
      const map = byId.get(mapId);
      for (const code of codes) if (!regionsOf(map, code)) throw new Error(`${mapId} has no ${code} to take away`);
      changes[mapId] = { regions: [], remove: codes };
    }
    views[id] = {
      id,
      name: view.name,
      nameJa: view.nameJa,
      note: view.note,
      noteJa: view.noteJa,
      source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries and its ${view.file.replace(/^ne_10m_admin_0_countries_|\.geojson$/g, "").toUpperCase()} point-of-view file as a ruler: the pieces of ${view.from} that lie in ${view.to} there, moved from the default outlines`,
      maps: changes,
    };
  }
  return views;
}

/** The view files: one module each, exported as the default. */
export function writeViews(views) {
  for (const view of Object.values(views)) {
    const path = join(out, "views", `${view.id}.data.ts`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
      path,
      `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * ${view.name}: ${Object.keys(view.maps).length} maps changed (${Object.keys(view.maps).join(", ")}).
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuViewData } from "../../views.ts";

/**
 * ${view.name}: the maps that change when a page asks for it (\`withView\`, or \`view\` on \`mountChizu\`), each with
 * the regions it draws again, and the note a page shows beside it.
 *
 * @example
 * \`\`\`ts
 * import view from "@johnmorrisdotca/chizu/views/${view.id}";
 *
 * console.log(view.id, Object.keys(view.maps).join(" "));
 * // ${view.id} ${Object.keys(view.maps).join(" ")}
 * \`\`\`
 */
const view: ChizuViewData = ${literal(view)};

export default view;
`,
    );
  }
}

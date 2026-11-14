// The files in longitude and latitude: `src/data/divisions-geo/<xx>.data.ts` (a country's regions), the table of loaders
// for them, and `src/data/world-geo-detail.data.ts` (the 1:50m world). Written unformatted, like `world-geo.data.ts`: the
// size of the file is the size of the data. See geo.mjs for how the outlines are simplified. The data is a string given to
// JSON.parse, not an object literal: a parser reads a string of 1.3 MB far faster than the same data as code, which is
// what a bundler, the docs-site's size measure and a browser each do with it.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { GEO_TOLERANCE_KM, NATURAL_EARTH } from "../data-config.mjs";
import { simplifyShared } from "./geo.mjs";
import { buildWorldGeoDetail, geoSources } from "./world.mjs";

const HEADER = `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
`;
const LICENCE = ` * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
`;

const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
};

/** One country's regions as a GeoJSON collection in the order of the flat map's regions, with the flat map's codes and names. */
export function divisionsGeo(map) {
  const raw = geoSources.get(map.id);
  if (!raw) throw new Error(`${map.id}: no features were kept for it`);
  const { geometries, stats } = simplifyShared(raw, { toleranceKm: GEO_TOLERANCE_KM.divisions, precision: 2 });
  const byCode = new Map(raw.map((feature, index) => [feature.properties.__code, geometries[index]]));
  const features = map.regions.map((region) => {
    const geometry = byCode.get(region.code);
    if (!geometry) throw new Error(`${map.id}: no outline for ${region.code}`);
    return {
      type: "Feature",
      properties: {
        code: region.code,
        ...(region.iso ? { iso: region.iso } : {}),
        name: region.name,
        ...(region.nameJa ? { nameJa: region.nameJa } : {}),
      },
      geometry,
    };
  });
  return {
    collection: {
      type: "FeatureCollection",
      features,
      source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m, longitude and latitude, rounded to 0.01 degree and simplified to ${GEO_TOLERANCE_KM.divisions} km`,
    },
    stats,
  };
}

const TYPE = `import type { ChizuGeoCollection } from "../../geo-types.ts";\n`;

/** Writes every country's file and the table of loaders; says how many points there were before and after, and the worst distance. */
export function writeDivisionsGeo(out, builtDivisions) {
  const loaders = [];
  const totals = { before: 0, after: 0, worstKm: 0 };
  for (const map of builtDivisions) {
    const file = map.id.replace("divisions-", "");
    const { collection, stats } = divisionsGeo(map);
    totals.before += stats.before;
    totals.after += stats.after;
    totals.worstKm = Math.max(totals.worstKm, stats.worstKm);
    const first = collection.features[0].properties;
    write(
      join(out, "divisions-geo", `${file}.data.ts`),
      `${HEADER} * ${map.name}: ${collection.features.length} ${map.regionNamePlural.toLowerCase()}, ${collection.source}.\n${LICENCE}\n${TYPE}
/**
 * ${map.name}'s regions as longitude and latitude in degrees (${collection.features.length}), each a GeoJSON feature with its \`code\`, \`iso\`, \`name\` and \`nameJa\`; the border two regions share is the same list of points in both.
 *
 * @example
 * \`\`\`ts
 * import divisionsGeo from "@johnmorrisdotca/chizu/divisions-geo/${file}";
 *
 * const first = divisionsGeo.features[0]!;
 * console.log(divisionsGeo.features.length, first.properties.code, first.properties.name);
 * // ${collection.features.length} ${first.code} ${first.name}
 * \`\`\`
 */
const divisionsGeo = JSON.parse(${JSON.stringify(JSON.stringify(collection))}) as ChizuGeoCollection;

export default divisionsGeo;
`,
    );
    loaders.push(file);
  }
  loaders.sort();
  write(
    join(out, "divisions-geo-loaders.data.ts"),
    `${HEADER} * One dynamic import for each country's regions as longitude and latitude, so that a bundler makes each its own
 * chunk and a page loads only the ones it draws. Separate from loaders.data.ts, which a page that wants only these
 * would otherwise pull the other maps' loaders in with.
${LICENCE}
import type { ChizuGeoCollection } from "../geo-types.ts";

/** The regions of the ${loaders.length} countries that have them, as longitude and latitude, by lower-case code. */
export const DIVISIONS_GEO_LOADERS: Readonly<Record<string, () => Promise<{ default: ChizuGeoCollection }>>> = {
${loaders.map((file) => `  ${JSON.stringify(file)}: () => import("./divisions-geo/${file}.data.ts"),`).join("\n")}
};
`,
  );
  return totals;
}

/** Writes the 1:50m world as longitude and latitude. */
export function writeWorldGeoDetail(out, countriesSource) {
  const { collection, stats } = buildWorldGeoDetail(countriesSource, GEO_TOLERANCE_KM.world);
  const japan = collection.features.find((feature) => feature.properties.code === "JP").properties;
  write(
    join(out, "world-geo-detail.data.ts"),
    `${HEADER} * The world: ${collection.features.length} countries, ${collection.source}.\n${LICENCE}\n${TYPE.replace("../../geo-types.ts", "../geo-types.ts")}
/**
 * The world as longitude and latitude in degrees from the 1:50m outlines, for a globe zoomed in: the same ${collection.features.length} countries and properties as the 1:110m \`world-geo\`, simplified with the borders between countries kept identical.
 *
 * @example
 * \`\`\`ts
 * import WORLD_GEO_DETAIL from "@johnmorrisdotca/chizu/world-geo-detail";
 *
 * const japan = WORLD_GEO_DETAIL.features.find((feature) => feature.properties.code === "JP")!;
 * console.log(WORLD_GEO_DETAIL.features.length, japan.properties.iso3, japan.properties.nameJa);
 * // ${collection.features.length} ${japan.iso3} ${japan.nameJa}
 * \`\`\`
 */
const worldGeoDetail = JSON.parse(${JSON.stringify(JSON.stringify(collection))}) as ChizuGeoCollection;

export default worldGeoDetail;
`,
  );
  return stats;
}

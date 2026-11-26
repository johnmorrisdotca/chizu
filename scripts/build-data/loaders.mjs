import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { literal, out } from "./geometry.mjs";

/** `src/data/loaders.data.ts`: one dynamic import for each map, feature file and view, and the table of the views. */
export function writeLoaders(loaders, viewTable) {
  const lines = (list, folder) =>
    list.map((file) => `  ${JSON.stringify(file)}: () => import("./${folder}/${file}.data.ts"),`).join("\n");
  writeFileSync(
    join(out, "loaders.data.ts"),
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * One dynamic import for each country's own map and each country's regions, so that a bundler makes each its own
 * chunk and a page loads only the ones it draws.
 */
import type { ChizuFeatureLayer, ChizuMap } from "../types.ts";
import type { ChizuViewData, ChizuViewInfo } from "../views.ts";

type Load = () => Promise<{ default: ChizuMap }>;

/** Each country alone, by lower-case code. */
export const COUNTRY_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.countries, "countries")}
};

/** The world drawn finer, from the 1:50m outlines, on the world's own canvas. */
export const WORLD_DETAIL_LOADER: Load = () => import("./world-detail.data.ts");

/** The ${loaders.divisions.length} maps of a country's regions, by lower-case code: the country's, or the country's and a year for a dated map (\`vn-2025\`, \`gb-2025\`). */
export const DIVISIONS_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.divisions, "divisions")}
};

/** The named physical features drawn on ${loaders.features.length} maps (seas, lakes, rivers, landforms, peaks), by the map's id. */
export const FEATURE_LOADERS: Readonly<Record<string, () => Promise<{ default: ChizuFeatureLayer }>>> = {
${loaders.features.map((id) => `  ${JSON.stringify(id)}: () => import("./features/${id}.data.ts"),`).join("\n")}
};

/** The ${loaders.views.length} points of view, by id: the pieces of a map that move and the regions it draws again. */
export const VIEW_LOADERS: Readonly<Record<string, () => Promise<{ default: ChizuViewData }>>> = {
${loaders.views.map((id) => `  ${JSON.stringify(id)}: () => import("./views/${id}.data.ts"),`).join("\n")}
};

/** The ${loaders.views.length} points of view with their names and notes, and the ids of the maps each changes. */
export const VIEW_TABLE: readonly ChizuViewInfo[] = ${literal(viewTable)};
`,
  );
}

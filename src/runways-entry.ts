/**
 * The runways of the airports in `@johnmorrisdotca/chizu/airports` (`@johnmorrisdotca/chizu/runways`), its own entry so that
 * a page that draws none never loads it: about 50 kB as data. Each open runway with both ends measured, from OurAirports
 * (the Unlicense). Hand it to `drawChizu`'s `runways`, beside `ports`.
 */

import data from "./ports-data/runways.data.ts";
import type { ChizuRunways } from "./runways.ts";

export type { ChizuRunway, ChizuRunways } from "./runways.ts";

/**
 * The open runways of the airports that have them, by the airport's `id`: each is `[lon1, lat1, lon2, lat2, widthMetres]`,
 * the ends measured to five places of a degree (about a metre).
 *
 * @example
 * ```ts
 * import { RUNWAYS } from "@johnmorrisdotca/chizu/runways";
 *
 * console.log(RUNWAYS.hnd?.length, RUNWAYS.hnd?.[0]?.length);
 * // 4 5
 * ```
 */
export const RUNWAYS: ChizuRunways = data;

/**
 * The credit line for the runways, in English and Japanese, to show where the runways are shown.
 *
 * @example
 * ```ts
 * import { RUNWAYS_CREDIT } from "@johnmorrisdotca/chizu/runways";
 *
 * console.log(RUNWAYS_CREDIT.en);
 * // Runways: OurAirports (public domain).
 * ```
 */
export const RUNWAYS_CREDIT: { readonly en: string; readonly ja: string } = Object.freeze({
  en: "Runways: OurAirports (public domain).",
  ja: "滑走路: OurAirports（パブリックドメイン）。",
});

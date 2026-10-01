/**
 * Loading a map by name, one country at a time: `loadCountry("fr")` is France alone, `loadDivisions("fr")` its
 * départements. Each is a dynamic import of a file of its own, so a bundler makes a chunk for each and a page fetches
 * only the ones it draws.
 */
import { COUNTRY_LOADERS, DIVISIONS_LOADERS } from "./data/loaders.ts";
import type { ChizuMap } from "./types.ts";

/** Every country that has a map of its own, by code, upper or lower case. */
export const COUNTRY_CODES: readonly string[] = Object.keys(COUNTRY_LOADERS).map((code) => code.toUpperCase());

/** Every country that has a map of its own regions (provinces, states, départements), by code. */
export const DIVISIONS_CODES: readonly string[] = Object.keys(DIVISIONS_LOADERS).map((code) => code.toUpperCase());

/** One country alone, drawn from Natural Earth's 1:50m countries (the small ones from 1:10m); `null` for a code with no map. */
export async function loadCountry(code: string): Promise<ChizuMap | null> {
  const load = COUNTRY_LOADERS[code.toLowerCase()];
  return load ? (await load()).default : null;
}

/** The regions of one country, from Natural Earth's 1:10m states and provinces; `null` for a country that has none. */
export async function loadDivisions(code: string): Promise<ChizuMap | null> {
  const load = DIVISIONS_LOADERS[code.toLowerCase()];
  return load ? (await load()).default : null;
}

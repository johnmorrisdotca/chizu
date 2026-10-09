/**
 * The name of every country, in English and Japanese, without any outlines: its own entry
 * (`@johnmorrisdotca/chizu/names`), 52 kB (10 kB gzipped), for a page that lists countries, looks one up by code or by what
 * somebody typed, or only needs to know which have a map of their own regions; and the seven continents and the UN
 * M49 subregions, each with its countries.
 */
export { CHIZU_CONTINENTS, CHIZU_COUNTRIES, CHIZU_SOURCE, CHIZU_SUBREGIONS } from "./data/countries.ts";
export { countriesFromText, countryByCode } from "./countries.ts";

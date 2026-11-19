import { DIVISION_CONFIGS } from "./divisions.mjs";

/*
 * THE UNITED KINGDOM'S COUNCILS OF 2025, A MAP OF THEIR OWN (`gb-2025`). Natural Earth draws England's, Scotland's and
 * Wales's councils as they were before the reforms of 2019 to 2023 (Dorset and Bournemouth, Christchurch and Poole in
 * 2019, Buckinghamshire in 2020, Northamptonshire in 2021, Cumbria, North Yorkshire and Somerset in 2023). The map `gb`
 * stays Natural Earth's as it was, since taking codes off it is for a major release; `gb-2025` beside it draws all of
 * those three from the ONS's counties and unitary authorities, so that the borders between them are one survey's lines,
 * and becomes `gb` at the next major. Northern Ireland on `gb-2025` is Natural Earth's, as on `gb`: its 26 districts of
 * before 2015, each with the code of the district it lies in now (ISO_JOIN), until there is a decision on Land and
 * Property Services' terms for its 11 districts of today. The ONS's file is under the Open Government Licence v3.0,
 * whose one condition is the two lines in `attribution`, on the map's `source`, on `CHIZU_SOURCE.ons` and in NOTICE.md.
 */
export const ONS = {
  name: "Counties and Unitary Authorities (December 2025) Boundaries UK BGC",
  publisher: "Office for National Statistics, Open Geography Portal",
  portal: "https://geoportal.statistics.gov.uk/datasets/ac443ef4c1de497a9675a6e72290f9cc",
  /** The feature service asked for every unit, its code and names, in longitude and latitude (outSR=4326), as GeoJSON, in the order of the codes. */
  query:
    "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Counties_and_Unitary_Authorities_December_2025_Boundaries_UK_BGC/FeatureServer/0/query?where=1%3D1&outFields=CTYUA25CD%2CCTYUA25NM%2CCTYUA25NMW&orderByFields=CTYUA25CD&outSR=4326&f=geojson",
  retrieved: "2026-11-18",
  /** The answer as saved in the cache, and its SHA-256: 218 units, of which the 11 of Northern Ireland (N09) are left out. */
  file: "ons_ctyua_dec_2025_uk_bgc.geojson",
  sha256: "23269639209d1425df0a3fc052dec4d9c0dc04922d7ae641ca9ebe8e4dbc91cd",
  licence: "Open Government Licence v3.0",
  /** The licence's own page. It asks for a link to this page where one can be given. */
  licenceUrl: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  attribution: [
    "Source: Office for National Statistics licensed under the Open Government Licence v.3.0",
    "Contains OS data © Crown copyright and database right 2025",
  ],
  /*
   * The ONS's lines are generalised to 20 m: 466,000 points for Great Britain, where Natural Earth's 1:10m has 18,500.
   * They are simplified with the borders kept one line (scripts/build-data/geo.mjs) to about Natural Earth's detail: on
   * a grid of 0.0001 degree, no line more than 0.7 km from the ONS's (the tolerance of the files in longitude and
   * latitude), and islands under 2 km² left out, as small as Natural Earth's smallest but one (a council's largest
   * piece is always kept). About 15,500 points are left.
   */
  simplify: { toleranceKm: 0.7, precision: 4, minRingKm2: 2 },
};

/**
 * The ONS as `CHIZU_SOURCE.ons` names it. `attribution` is the statement the Open Government Licence requires, in the
 * ONS's own words. `nameJa` is the office's Japanese name. Those English lines are not translated.
 */
export const CHIZU_ONS_SOURCE = {
  name: "Office for National Statistics",
  nameJa: "英国国家統計局",
  product: ONS.name,
  licence: ONS.licence,
  licenceUrl: ONS.licenceUrl,
  attribution: ONS.attribution,
};

/**
 * The map: the United Kingdom's own settings (canvas, projection, groups), with the ONS's councils (marked `ons` by
 * withOns in scripts/build-data/divisions.mjs) and Natural Earth's Northern Ireland. Its ISO_JOIN and NAME_FIXES
 * lines are keyed `GB-2025:`; `country` is the country it is a map of.
 */
export const GB_2025 = {
  ...DIVISION_CONFIGS.find((config) => config.code === "GB"),
  code: "GB-2025",
  country: "GB",
  filter: (f) =>
    f.properties.ons === true || (f.properties.iso_a2 === "GB" && f.properties.geonunit === "Northern Ireland"),
};

/** The kind of each unit, by the first three characters of its ONS code (the GSS entity), in the ONS's words. */
export const ONS_TYPES = {
  E06: "Unitary authority",
  E08: "Metropolitan district",
  E09: "London borough",
  E10: "County",
  S12: "Council area",
  W06: "Unitary authority",
};

/*
 * The ISO 3166-2 code of each unit is kuni's subdivision of the same English name. These are the units whose ONS name
 * is not kuni's, keyed by ONS code. A unit with neither (Cumberland and Westmorland and Furness, which ISO 3166-2 has
 * not coded) is coded by its ONS code and has a line in ISO_JOIN saying why.
 */
export const ONS_ISO = {
  E06000010: "GB-KHL", // Kingston upon Hull, City of
  E06000019: "GB-HEF", // Herefordshire, County of
  E06000023: "GB-BST", // Bristol, City of
  E06000047: "GB-DUR", // County Durham
  E08000013: "GB-SHN", // St. Helens
  E09000001: "GB-LND", // City of London
  S12000013: "GB-ELS", // Na h-Eileanan Siar
  S12000027: "GB-ZET", // Shetland Islands
  S12000033: "GB-ABE", // Aberdeen City
  S12000036: "GB-EDH", // City of Edinburgh
  S12000042: "GB-DND", // Dundee City
  S12000049: "GB-GLG", // Glasgow City
  W06000001: "GB-AGY", // Isle of Anglesey
};

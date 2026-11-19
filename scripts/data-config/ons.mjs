/*
 * GREAT BRITAIN'S REGIONS FROM THE OFFICE FOR NATIONAL STATISTICS. Natural Earth draws England's, Scotland's and Wales's
 * councils as they were before the reforms of 2019 to 2023 (Dorset and Bournemouth, Christchurch and Poole in 2019,
 * Buckinghamshire in 2020, Northamptonshire in 2021, Cumbria, North Yorkshire and Somerset in 2023), so those three are
 * drawn from the ONS's counties and unitary authorities instead, every one of them, so that the borders between them
 * are one survey's lines. Northern Ireland stays Natural Earth's: its 26 districts of before 2015, each with the code
 * of the district it lies in now (ISO_JOIN), until there is a decision on Land and Property Services' terms for its
 * 11 districts of today. The ONS's file is under the Open Government Licence v3.0, whose one condition is the two
 * lines in `attribution`, carried by the map's `source` and by NOTICE.md.
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
  attribution: [
    "Source: Office for National Statistics licensed under the Open Government Licence v.3.0",
    "Contains OS data © Crown copyright and database right 2025",
  ],
  /*
   * The ONS's lines are generalised to 20 m: 466,000 points for Great Britain, where Natural Earth's 1:10m has 18,500.
   * They are simplified with the borders kept one line (scripts/build-data/geo.mjs) to about Natural Earth's detail: on
   * a grid of 0.001 degree, no line more than 0.7 km from the ONS's (the tolerance of the files in longitude and
   * latitude), and islands under 2 km² left out, as small as Natural Earth's smallest but one (a council's largest
   * piece is always kept). About 16,000 points are left.
   */
  simplify: { toleranceKm: 0.7, precision: 4, minRingKm2: 2 },
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

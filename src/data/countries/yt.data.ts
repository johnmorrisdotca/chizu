/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Mayotte, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Mayotte, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/yt";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-yt country 1 0 0 708 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-yt",
  kind: "country",
  name: "Mayotte",
  nameJa: "マヨット",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 708 1000",
  width: 708,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [45.142169, -12.817377],
    scale: 167553.58,
    translate: [284.364, 497.553],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "YT",
      name: "Mayotte",
      nameJa: "マヨット",
      reading: "マヨット",
      group: "Africa",
      groupJa: "アフリカ",
      iso3: "MYT",
      path: "M626.76,339.67L669.26,293.28L684.82,281.39L704.05,329.48L708.44,370.89L701.45,412.77L684.72,461.07L665.22,461.06ZM451.31,221.33L499.59,253.95L520.01,287.99L520.46,328.44L507.91,381.03L440.58,480.97L415.51,496.67L417.13,530.94L435.45,565.22L486.73,598.31L480.45,637.81L461.65,676.36L451.2,692.3L425.44,753.7L378.81,809.38L358.62,868.63L410.33,940.51L398.73,960.74L386.67,976.21L372.29,987.87L351.88,1000L334.96,969.06L315.48,972.16L290.43,990L254.95,1000L222.95,991.43L202.08,976.2L183.29,967.64L156.16,980.02L159.86,937.66L148.49,909.34L121.36,896.26L79.61,900.07L79.6,882.22L131.09,857.22L136.18,809.39L110.66,763.46L57.29,734.92L65.18,719.21L86.98,705.16L118.53,702.3L135.93,713L186.74,773.44L234.76,802L261.44,788.67L268.16,750.59L254.94,702.28L232.2,666.34L202.04,632.08L118.5,560.93L158.4,544.51L176.97,542.6L176.96,522.61L160.25,497.86L147.71,455.03L137.95,370.3L127.5,328.9L102.43,311.06L70.39,300.83L40.44,281.32L20,254.68L7.69,228.03L1.41,195.19L0,149.73L137.88,0L149.03,18.56L152.51,27.13L156,39.74L143.46,42.84L136.03,46.88L118.38,59.74L136.96,58.07L145.55,63.78L149.73,72.58L156,79.72L194.32,112.8L246.56,176.09L274.42,197.99L314.12,207.51L403.03,206.8Z",
      neighbors: [],
      bbox: [0, 0, 708.44, 1000],
      centroid: [284.36, 497.55],
    },
  ],
};

export default map;

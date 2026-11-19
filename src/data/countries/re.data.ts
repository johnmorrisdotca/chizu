/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Réunion, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Réunion, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/re";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-re country 1 0 0 1000 868
 * ```
 */
const map: ChizuMap = {
  id: "country-re",
  kind: "country",
  name: "Réunion",
  nameJa: "レユニオン",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 1000 868",
  width: 1000,
  height: 868,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [55.541602, -21.119428],
    scale: 97621.37,
    translate: [502.811, 439.556],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "RE",
      name: "Réunion",
      nameJa: "レユニオン",
      reading: "レユニオン",
      group: "Africa",
      groupJa: "アフリカ",
      iso3: "REU",
      path: "M894.24,412.63L916.33,427.23L973.2,451.45L992.69,471.04L1000,504.05L991.41,532.6L977.78,561.14L951.57,686.85L947.89,722.2L948.74,753.82L945.96,790.14L931.96,820.07L899.01,832.49L842.58,830.75L814.42,835.43L764.54,862.27L727.35,867.92L690.55,865.81L664.99,855.53L638,865.5L597.97,867.14L555.87,862.97L523.2,855.48L495.7,841.06L445.72,804.6L397.79,793.1L332.55,767.07L306.31,750.73L293.64,736.04L284.58,720.8L274.5,709.16L257.44,704.46L205.75,704.1L197.99,698.7L186.34,675.01L131.19,610.19L112.01,576.52L104.71,537.02L104.27,507.07L100.48,481.15L33.46,391.41L12.55,354.57L0.06,318.82L0,287.21L9.12,253.08L26.03,225.31L79.32,202.76L99.09,176.38L106.16,145.59L98.36,120.92L107.92,110.92L111.02,103.15L107.9,95.39L98.3,85.98L123.02,74.85L175.48,74.5L220.13,42.27L290.06,3.1L366.24,0L392.8,3.04L438.67,20.08L458.88,23.4L479.74,14.66L504.23,23.26L561.36,22.71L583.51,32.15L605.01,45.74L676.38,62.42L697.36,74.64L713.28,88.24L747.43,125.84L759.32,149.98L765.22,205.73L774,225.29L812.92,266.65L818.34,278.31L820.63,312.14L824.1,329.34L829.13,342.93L839.08,350.43L866.76,362.12L872.57,371.42L875.27,379.33Z",
      neighbors: [],
      bbox: [0, 0, 1000, 867.92],
      centroid: [502.81, 439.56],
    },
  ],
};

export default map;

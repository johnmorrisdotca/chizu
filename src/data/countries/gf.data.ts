/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * French Guiana, alone: Natural Earth 5.1.2 admin-0 map units, 1:50m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * French Guiana, alone: Natural Earth 5.1.2 admin-0 map units, 1:50m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/gf";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-gf country 1 0 0 808 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-gf",
  kind: "country",
  name: "French Guiana",
  nameJa: "仏領ギアナ",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 808 1000",
  width: 808,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-53.24842, 3.925265],
    scale: 15650.93,
    translate: [373.359, 507.291],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:50m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "GF",
      name: "French Guiana",
      nameJa: "仏領ギアナ",
      reading: "ふつりょうぎあな",
      group: "South America",
      groupJa: "南アメリカ",
      iso3: "GUF",
      path: "M0,943.65L3.15,941.19L13.07,939.35L21.93,939.16L35.7,919.29L58.52,906.92L98.22,838.08L114.96,809.65L117,794.08L121.77,761.65L112.96,722.15L117.09,711.07L151.18,663.42L165.82,637.42L166.82,615.03L171.06,598.91L166.86,590.47L159.14,588.01L146.14,567.09L137.76,549.74L114.7,531.96L98.9,513.73L73.01,471.9L75.38,448.43L68.04,439.97L60.08,431.35L60.68,420.72L55.34,394.42L48.66,369.72L46.25,354.15L52.7,327.39L48.89,297.61L40.5,281.94L38.22,258.11L39.98,236.76L47.21,224.73L45.78,209.79L78.66,162.33L103.59,134.82L126.52,115.52L145.76,101.11L171.87,28.97L190.84,3.6L210.62,0L317.34,59.8L367.39,65.33L468.3,97.6L504.86,138.98L589.55,207.78L634.05,229.35L634.52,247.4L624.84,276.15L653.29,251.02L697.41,290.68L709.91,310.16L723.69,346.08L718.98,369.18L712.91,381.11L712.59,390.39L725.68,377.59L733.05,367.45L735.21,343.36L745.86,313.45L760.22,312.89L771.66,330.68L795.5,408.13L804.47,423.96L807.94,448.55L806.65,459.56L808.18,469.72L799.77,475.63L777.01,488.52L766.63,505.68L760.61,522.17L746.45,533.4L733.01,547.52L728.82,558.96L716.22,568.02L713.81,583.09L682.1,636.29L669.45,660.23L651.25,685.66L639.86,695.12L624.43,710.26L616.6,727.75L616.62,745.83L605.79,767.51L599.8,786.19L589.59,797.04L562.67,856.2L561.37,876.56L554.96,888.65L535.82,916.84L522.88,933.8L500.29,946.51L476.55,960.32L467.53,975.38L450.77,983.03L438.52,983.53L418.72,978.08L392.02,975.45L378.45,977.21L372.33,969.73L363.24,952.54L349.88,940.38L341.26,944.62L323.29,956.84L302.23,964.03L287.22,961.62L254.54,953.14L240.62,948.87L236.41,941.64L231.6,936.22L224.38,938.63L214.73,947.65L201.88,957.11L182.81,969.58L143.68,991.97L132.66,1000L122.48,995.62L105.94,991.16L88.18,990.89L49.96,976.29L27.59,965.9L17.94,952.88L6.63,947.21Z",
      neighbors: ["BR", "SR"],
      bbox: [0, 0, 808.18, 1000],
      centroid: [373.36, 507.29],
    },
  ],
};

export default map;

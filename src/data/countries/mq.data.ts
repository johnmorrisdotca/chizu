/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Martinique, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Martinique, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/mq";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-mq country 1 0 0 864 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-mq",
  kind: "country",
  name: "Martinique",
  nameJa: "マルティニーク",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 864 1000",
  width: 864,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-61.017547, 14.656375],
    scale: 122224.56,
    translate: [435.719, 470.49],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "MQ",
      name: "Martinique",
      nameJa: "マルティニーク",
      reading: "マルティニーク",
      group: "North America",
      groupJa: "北アメリカ大陸",
      iso3: "MTQ",
      path: "M863.58,884.98L838.29,896.29L813.21,958.46L791.79,987.12L768.6,997.29L739.34,1000L714.79,988.99L705.86,958.01L718.29,936.3L741.57,928.82L761.48,917.61L763.47,885.06L743.53,855.21L715.22,866.86L682.45,887.45L649.33,885.13L650.84,863.51L637.14,860.83L580.16,870.74L459.63,854.71L427.36,859.48L376.17,880.48L345.57,885.17L328.26,875.09L282.73,810.93L283.74,795.05L281.14,786.37L272.07,779.42L253.33,768.65L309.82,708.95L363.93,682.32L381.49,665.39L403.25,697.68L435.34,707.41L465.08,696.3L480.2,665.39L473.23,651.85L457.52,629.46L442.4,599.6L437.94,563.49L407.12,574.08L382,579.11L359.91,579.8L337.9,578.06L294.56,580.83L282.8,578.05L273.9,568.84L260.98,543.32L253.42,534.29L179.71,483.82L142.61,447.87L126.6,409.84L125.1,396.38L120.65,384.92L113.78,374.67L104.88,364.77L97.17,349.49L100.46,335.34L107.43,321.55L111.3,307.14L106.54,281.45L94.47,256.96L78.87,235.77L20.01,173.57L5.43,147.34L0,117.04L5.48,88.14L19.35,64.72L37.65,47.81L119.41,1.09L191.72,0L261.68,22.86L352.61,81.57L433.5,117.77L467.23,139.73L475.71,155.18L480.83,174.01L491.23,189.9L515.24,196.66L551.77,270.87L581.47,246.47L623.35,225.62L671.6,212.93L720.87,212.47L706.44,224.54L693.77,232.79L687.73,241.22L692.69,254.93L649.07,299.91L624.2,258.87L608.43,270.07L602.56,310.7L606.95,358.26L624.24,350.27L639.18,351.3L652.12,359.11L663.21,371.34L606.96,402.01L622.34,417.71L597.23,430.74L600.93,449.06L618.74,455.21L636.45,430.99L705.57,461.51L689.95,463.08L681.81,466.9L674.84,471.42L663.26,476.03L676.2,508.4L692,524.97L733.76,548.81L739.81,559.83L742.85,574.41L750.5,587L770.33,592.54L784.95,598.95L792.01,614.91L793.37,634.36L791.54,651.98L818.49,636.25L810.87,663.86L809.72,690.94L816.79,716.45L833.78,739.44L821.1,746.13L815.98,751.96L812.54,758.73L805.74,768.54L832.81,781.71L844.1,811.04L850.68,844.63L863.57,870.57Z",
      neighbors: [],
      bbox: [0, 0, 863.58, 1000],
      centroid: [435.72, 470.49],
    },
  ],
};

export default map;

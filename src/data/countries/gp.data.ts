/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Guadeloupe, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Guadeloupe, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/gp";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-gp country 1 0 0 1000 858
 * ```
 */
const map: ChizuMap = {
  id: "country-gp",
  kind: "country",
  name: "Guadeloupe",
  nameJa: "グアドループ",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 1000 858",
  width: 1000,
  height: 858,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-61.529624, 16.208264],
    scale: 73833.84,
    translate: [331.797, 392.823],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "GP",
      name: "Guadeloupe",
      nameJa: "グアドループ",
      reading: "グアドループ",
      group: "North America",
      groupJa: "北アメリカ",
      iso3: "GLP",
      path: "M747.68,748.39L746.85,764.49L743.09,776.09L735.04,786.17L720.83,797.57L689.89,813.24L647.54,823.68L610.11,817.64L593.84,784.15L592.57,775.66L589.48,765.33L585.24,756.63L580.75,753.02L576.66,748.77L581.89,739.33L593.77,722.22L597.33,703.66L606.04,689.81L628.39,664.25L655.49,649.06L685.74,655.83L710.42,676.98L724.84,713.82L734.13,721.41L743.47,731.67ZM1000,213.96L937.46,255.96L902.01,271.09L873.52,267.06L889.71,258.27L938.32,216.58L968.28,204.23ZM304.53,293.23L307.6,299.63L299.9,328.41L309.11,353.95L300.9,356.41L278.55,361.49L270.14,374.71L272.79,434.48L288.55,479.58L297,549.95L286.76,618.01L247.74,665.4L190.81,699.35L126.97,726.63L125.01,719.08L117.77,700.25L127,691.44L118.24,674.13L107.36,664.48L94.67,656.13L80.16,643.06L71.16,627.79L66.74,613L61.61,600.88L50.94,593.79L35.87,548.1L34.98,446.48L16.66,400.26L22.67,381.08L17.05,365.5L7.3,351.64L0.57,337.79L0,315.77L4.99,275.61L0.68,258.67L12.77,248.25L33.55,211.52L51.38,196.28L74.32,190.33L85.79,197.68L93.88,208.91L106.25,214.74L137.19,220.79L182.77,236.77L225.18,259.33L246.3,285.3L228.73,293.21L239,297.41L240.86,298.82L241.01,297.51L246.3,293.21L250.23,298.25L263.21,311.57L269.2,297.63L281.18,287.82L296.73,285.31ZM313.79,293.44L313.9,293.33L313.9,293.23L334.23,225.85L346,211.54L368.84,206.03L372.06,201.47L373.97,190.66L374.32,178.66L373.06,170L367.98,164.24L359.38,158.84L349.12,154.7L339.26,152.49L332.37,106.46L326.58,94.92L326.03,82.23L336.74,65.45L356.15,42.12L361.18,33.67L373.04,24.97L411.25,4.2L414.71,0L418.68,1.68L458.82,30.76L480.35,52.3L494.95,78.88L500.4,112.85L497.41,146.67L499.28,159.41L508.8,179.59L520.99,197.78L534.48,211.61L550.04,222.61L567.91,232.35L576.46,222.74L589.14,229.5L601.12,230.43L613.7,229.94L627.89,232.28L639.77,239.56L666.62,262.49L673.93,267.41L686.82,273.9L753.94,320.88L777.71,327.45L784.67,334.77L770.79,346.44L760.42,346.25L725.67,337.81L716.25,333.31L696.97,328.1L478.93,378.34L437.2,396.92L415.3,400.45L388.61,395.89L364.24,386.35L343.19,373.87L326.58,360.45L313.89,344.62L308.66,328.67L309.11,311.9ZM213.99,827.1L218.43,831.61L224.63,841.52L221.25,851.53L210.4,858.35L197.03,850.32L201.68,833.64ZM286.12,817.94L286.67,819.99L287.93,823.03L281.07,829.22L266.65,839.28L253.68,843.68L249.9,837.91L256.36,831.83L263.02,827.85L269.43,814.79L276.94,811.49L284.25,814.48Z",
      neighbors: [],
      bbox: [0, 0, 1000, 858.35],
      centroid: [331.8, 392.82],
    },
  ],
};

export default map;

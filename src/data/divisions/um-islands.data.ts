/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * U.S. Minor Outlying Islands: 9 islands and atolls, Natural Earth 5.1.2 admin-0 map units, 1:10m; each of the nine places of ISO 3166-2:UM drawn in a box of its own.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * U.S. Minor Outlying Islands: 9 islands and atolls, Natural Earth 5.1.2 admin-0 map units, 1:10m; each of the nine places of ISO 3166-2:UM drawn in a box of its own.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/divisions/um-islands";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // divisions-um-islands divisions 9 0 0 1000 680
 * ```
 */
const map: ChizuMap = {
  id: "divisions-um-islands",
  kind: "divisions",
  name: "U.S. Minor Outlying Islands",
  nameJa: "合衆国領有小離島",
  regionName: "Island or atoll",
  regionNamePlural: "Islands and atolls",
  viewBox: "0 0 1000 680",
  width: 1000,
  height: 680,
  wraps: false,
  projection: {
    kind: "other",
    description:
      "a Lambert azimuthal equal-area of its own for each place, centred on it and fitted to its own box in a 3 by 3 grid, so no two places are at one scale",
  },
  insets: [
    { code: "67", box: { x: 25, y: 20, width: 300, height: 200 } },
    { code: "71", box: { x: 350, y: 20, width: 300, height: 200 } },
    { code: "76", box: { x: 675, y: 20, width: 300, height: 200 } },
    { code: "79", box: { x: 25, y: 240, width: 300, height: 200 } },
    { code: "81", box: { x: 350, y: 240, width: 300, height: 200 } },
    { code: "84", box: { x: 675, y: 240, width: 300, height: 200 } },
    { code: "86", box: { x: 25, y: 460, width: 300, height: 200 } },
    { code: "89", box: { x: 350, y: 460, width: 300, height: 200 } },
    { code: "95", box: { x: 675, y: 460, width: 300, height: 200 } },
  ],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m; each of the nine places of ISO 3166-2:UM drawn in a box of its own",
  regions: [
    {
      code: "67",
      iso: "UM-67",
      name: "Johnston Atoll",
      nameJa: "ジョンストン島",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M178.63,40.4L217.75,30L231.92,30.7L206.62,47.79L186.39,58.36L166.15,63.82L141.69,65.23L149.79,56.42L169.02,47.79ZM170.03,157.87L211.18,161.74L131.23,206.13L107.79,210L98.85,199.43L106.44,182.53ZM247.44,110.66L247.44,103.62L251.15,109.08Z",
      neighbors: [],
      bbox: [98.85, 30, 251.15, 210],
      centroid: [159, 140.41],
    },
    {
      code: "71",
      iso: "UM-71",
      name: "Midway Atoll",
      nameJa: "ミッドウェー島",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M608.2,98.64L633.01,114.5L640,122.8L624.68,126.96L582.24,130.19ZM490.68,83.17L462.88,114.9L431.25,139.27L396.29,155.14L360,160.99L377.82,117.73L407.45,90.54L445.73,79.02Z",
      neighbors: [],
      bbox: [360, 79.02, 640, 160.98],
      centroid: [449.73, 116.55],
    },
    {
      code: "76",
      iso: "UM-76",
      name: "Navassa Island",
      nameJa: "ナヴァッサ島",
      group: "Caribbean Sea",
      groupJa: "カリブ海",
      type: "territory",
      path: "M766.77,30L791.74,43.17L871.04,43.17L874.8,47.12L899.77,47.12L924.75,82.33L933.18,86.93L933.18,117.53L933.19,131.03L929.13,139.58L929.13,187.95L912.58,201.12L899.78,201.12L891.66,210L871.05,210L862.62,201.12L837.64,201.12L829.21,196.51L816.72,196.51L808.29,187.95L808.29,179.08L796.11,166.24L796.11,148.47L771.14,117.53L771.14,113.26L754.27,104.7L716.82,60.6L721.18,30Z",
      neighbors: [],
      bbox: [716.81, 30, 933.19, 210],
      centroid: [840.92, 112.6],
    },
    {
      code: "79",
      iso: "UM-79",
      name: "Wake Island",
      nameJa: "ウェーク島",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M82.14,393.8L140.38,389.19L188.07,365.15L203.21,319.96L168.82,250L244.02,297.62L267.86,378.26L222,430Z",
      neighbors: [],
      bbox: [82.14, 250, 267.86, 430],
      centroid: [206.92, 360.9],
    },
    {
      code: "81",
      iso: "UM-81",
      name: "Baker Island",
      nameJa: "ベーカー島",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M432.55,398.7L451.3,397.87L466.54,391.69L477.86,393.96L485.89,416L465.5,430L455.62,424.23L447.38,409.82ZM565.59,250L567.45,283.78L543.35,270.39Z",
      neighbors: [],
      bbox: [432.55, 250, 567.45, 430],
      centroid: [489.13, 371.64],
    },
    {
      code: "84",
      iso: "UM-84",
      name: "Howland Island",
      nameJa: "ハウランド島",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M847.72,430L801.41,303.3L806.21,286.7L810.58,271.41L817.14,250L848.59,288.01Z",
      neighbors: [],
      bbox: [801.41, 250, 848.59, 430],
      centroid: [829.96, 325.14],
    },
    {
      code: "86",
      iso: "UM-86",
      name: "Jarvis Island",
      nameJa: "ジャーヴィス島",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M58.46,510.5L291.55,470L252.4,576.2L116.05,650Z",
      neighbors: [],
      bbox: [58.45, 470, 291.55, 650],
      centroid: [171.49, 548.97],
    },
    {
      code: "89",
      iso: "UM-89",
      name: "Kingman Reef",
      nameJa: "キングマン・リーフ",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M410.57,470L589.43,470L589.43,650L410.57,650Z",
      neighbors: [],
      bbox: [410.57, 470, 589.43, 650],
      centroid: [500, 560],
    },
    {
      code: "95",
      iso: "UM-95",
      name: "Palmyra Atoll",
      nameJa: "パルミラ環礁",
      group: "Pacific Ocean",
      groupJa: "太平洋",
      type: "territory",
      path: "M945.2,514.83L965,543.7L943.71,598.95L870.92,623.84L761,609.91L741.44,587.26L763.23,590.49L785.76,569.59L858.79,525.03L839.73,525.78L812.25,533.25L784.28,535.24L744.42,523.29L705.3,519.56L685,506.36L696.63,496.16L881.32,496.67Z",
      neighbors: [],
      bbox: [685, 496.16, 965, 623.84],
      centroid: [849.77, 554.2],
    },
  ],
};

export default map;

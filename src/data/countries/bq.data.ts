/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Caribbean Netherlands, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Caribbean Netherlands, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/bq";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-bq country 1 0 0 924 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-bq",
  kind: "country",
  name: "Caribbean Netherlands",
  nameJa: "オランダ領カリブ",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 924 1000",
  width: 924,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-67.835261, 12.661899],
    scale: 10113.47,
    translate: [100.411, 887.111],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "BQ",
      name: "Caribbean Netherlands",
      nameJa: "オランダ領カリブ",
      reading: "おらんだりょうかりぶ",
      group: "North America",
      groupJa: "北アメリカ",
      iso3: "BES",
      path: "M35.5,963.64L36.69,964.5L38.49,966.14L39.21,967.75L37.21,968.45L35.61,970.35L36.85,979.58L36.55,983.03L35.06,984.16L31.91,984.35L30.76,985.44L30.84,986.99L32.56,991.54L32.99,993.26L32.7,994.94L31.95,997.19L31,999.16L30.1,1000L28.08,999.72L27.14,998.93L23.54,991.13L22.72,987.98L22.4,984.76L23.18,979.24L23.29,975.66L22.42,972.05L19.79,968.05L16.56,966.12L8.2,964.8L4.4,963.64L1.15,961.42L0,958.47L2.44,955.03L1.15,953.94L1.9,951.83L3.01,950.11L4.67,949.09L7.05,949.12L9.66,950.51L13.28,955.33L14.75,956.38L17.69,957.12L28.43,962.31L33.95,963.1ZM915.21,20.6L917.49,21.95L918.64,24.32L920.68,25.2L924.14,27.52L923.55,29.83L921.93,31.24L918.15,30.76L915.76,26.5ZM874.11,0L875.5,0.79L876.66,3.08L875.73,5.03L874.25,5.69L872.04,4.13L872.37,1.19Z",
      neighbors: [],
      bbox: [0, 0, 924.14, 1000],
      centroid: [100.53, 886.98],
    },
  ],
};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of French Guiana (country-gf): 1 seas, 0 lakes, 2 rivers, 3 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-gf.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-gf";
 * console.log(layer.map, layer.features.length);
 * // country-gf 8
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-gf",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gf; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q97",
      kind: "ocean",
      group: "marine",
      name: "Atlantic Ocean",
      nameJa: "大西洋",
      reading: "たいせいよう",
      rank: 0,
      path: "M809,468.3L808.2,469.7L806.6,459.6L807.9,448.6L804.5,424L795.6,408.1L771.6,330.7L760.2,312.9L745.8,313.4L735.2,343.3L733.1,367.5L725.8,377.6L712.7,390.3L712.9,381.1L719,369.2L723.7,346.1L709.9,310.1L697.4,290.6L653.2,251.1L624.9,276.1L634.5,247.3L634.1,229.4L589.5,207.8L504.8,138.9L468.4,97.6L367.3,65.4L317.3,59.7L210.6,0L190.9,3.6L171.8,29L145.7,101.1L126.6,115.5L147,76.4L156.6,47.3L158.9,16.9L155.5,-1L809,-1Z",
      bbox: [126.6, -1, 809, 469.7],
      centroid: [688.3, 121.3],
      neighbors: [],
    },
    {
      code: "Q244451",
      kind: "basin",
      group: "landforms",
      name: "Amazon basin",
      nameJa: "アマゾン盆地",
      reading: "あまぞんぼんち",
      rank: 1,
      path: "M-1,946.6L57,1000.8L447,957.6L552.9,938.3L620.1,706.9L806.3,436.7L807.9,448.6L806.6,459.6L808.2,469.7L809,468.2L809,1001L-1,1001Z",
      bbox: [-1, 436.7, 809, 1001],
      centroid: [691.1, 882],
      neighbors: [],
    },
    {
      code: "Q208807",
      kind: "range",
      group: "landforms",
      name: "Guiana Highlands",
      nameJa: "ギアナ高地",
      reading: "ぎあなこうち",
      rank: 3,
      path: "M155.5,-1L158.9,16.8L156.5,47.3L147.1,76.4L126.5,115.5L145.8,101.1L171.9,29L190.5,4L262.3,29L317.3,59.8L366.8,65.3L442.2,91.4L628.9,264.1L624.8,276.2L633.5,268.5L635.4,270.1L713.6,379.7L712.9,381.1L712.6,390.4L717.7,385.4L809,513.1L809,1001L-1,1001L-1,-1Z",
      bbox: [-1, -1, 809, 1001],
      centroid: [389.8, 611.2],
      neighbors: [],
    },
    {
      code: "Q1457996",
      kind: "range",
      group: "landforms",
      name: "Tumuc-Humac Mountains",
      nameJa: "トゥムクマケ山脈",
      reading: "とぅむくまけさんみゃく",
      rank: 5,
      path: "M-1,823.6L137.6,886.1L425.3,870.9L544.8,860.2L529.9,1001L-1,1001Z",
      bbox: [-1, 823.6, 544.8, 1001],
      centroid: [68.3, 931.7],
      neighbors: [],
    },
    {
      code: "Q1369002",
      kind: "river",
      group: "rivers",
      name: "Maroni",
      nameJa: "マロニ川",
      reading: "まろにがわ",
      rank: 7,
      path: "M154.6,586.6L154.5,584.9L148.1,575.2L142.6,555.8L139.8,552.8L134.1,544.4L131.2,542.5L121.9,539.7L117.2,537.3L114.5,534L111.9,528.6L109.9,525.4L108.9,525.6L107.7,523.2L102.6,520.4L95.9,507.8L90.3,502.9L88.5,500.4L85.5,490.9L83.8,488.2L74.5,479.8L72,475.2L71.6,468.5L72.7,464.2L76.4,454.8L77.2,450.7L76.2,445L73.3,442.8L64.2,440.3L60.8,438L57.7,434.3L56.6,429.6L59.6,424.5L61.3,419.9L61.1,412.9L58.7,401.1L50.4,383.8L45.7,354.3L46.5,347.4L51.9,337.4L53.2,332.7L53.2,321.5L52.7,318.3L49.4,309.4L49.1,302.7L50.1,297.5L50,292.8L46.8,287.8L44.1,286.3L41.4,285.5L39.1,284L38.3,280.3L38.3,246.6L36.6,242.7L36.1,239.9L37.4,237.2L44.6,232.2L45.9,230.7L46.5,226.7L44.1,215.8L44.9,211.1L46.6,206.8L51.6,198.9L66.5,182.1L67.4,180.4L68,177.3L69.3,175.6L73.4,172.6L75.2,170.7L78.4,159.9L84,151.8L95.5,140L116.9,124.6L122.4,118.6",
      bbox: [36.1, 118.6, 154.6, 586.6],
      centroid: [45.9, 355.4],
      angle: 84,
      neighbors: ["Q2645279"],
    },
    {
      code: "Q2645279",
      kind: "river",
      group: "rivers",
      name: "Litani",
      rank: 7,
      path: "M-1,903.2L1.2,903.6L4.8,905.5L7.8,908L11.2,909.6L18.7,911.9L32.3,914.3L35.5,915.9L45.1,915.8L49.2,915.2L52.5,913.9L65.5,900.8L69.9,894.2L80.6,867.3L90.2,847.8L110.1,820.9L112.2,816.7L116.6,804L118.4,801.8L121.7,800L116.4,795.2L115.9,793.4L116.1,790.5L117.1,787.4L121.7,780.2L123.7,771.9L123.6,768.1L122.1,767.7L119.1,764.3L117.6,760.5L120.8,758.6L122,756.9L121.5,753.1L119.8,746.5L116.1,743.7L116.7,742.2L119.8,740L120.5,734.2L119.9,728L116.9,724.1L110.6,725.1L116.2,711.2L120,705.1L130,692.9L137,681.9L146.3,675.3L149.3,670.5L151.1,665.2L151.7,660.4L153,656.7L162.9,646.4L167.4,635.5L166.5,614.8L168.7,603.4L170.9,597.2L171.3,593L169.7,589.6L165.9,585.6L163.4,584.7L154.6,586.6",
      bbox: [-1, 584.7, 171.3, 915.9],
      centroid: [121.6, 767.1],
      angle: -87,
      neighbors: ["Q1369002"],
    },
    {
      code: "Q2550799",
      kind: "peak",
      group: "peaks",
      name: "Bellevue de l'Inini",
      nameJa: "ベルヴューデリーニニ山",
      reading: "べるゔゅーでりーににさん",
      rank: 9,
      elevation: 851,
      path: "",
      bbox: [299.3, 601.6, 299.3, 601.6],
      centroid: [299.3, 601.6],
      neighbors: [],
    },
    {
      code: "capital-GF",
      kind: "capital",
      group: "capitals",
      name: "Cayenne",
      nameJa: "カイエンヌ",
      reading: "カイエンヌ",
      rank: 0,
      path: "",
      bbox: [620.6, 230, 620.6, 230],
      centroid: [620.6, 230],
      neighbors: [],
    },
  ],
};

export default layer;

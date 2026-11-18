/**
 * THE SMALLEST COUNTRIES, AS DOTS on the world. The flat world is drawn at 1:110m, which leaves 65 of the 238
 * countries off because each is narrower than a pixel of it; left off, a world quiz would never ask for Singapore,
 * Malta or Bahrain. Each of 62 is put back as a dot (a small round region marked `small: true`) at the middle of its
 * largest island or piece, read from the 1:50m outlines of `@johnmorrisdotca/chizu/world-geo-detail` and rounded to
 * 0.01 degree, and projected onto the world's canvas when the map is made, so no generated data changes and the
 * 1:110m shapes are the same ones. Ashmore and Cartier, the Indian Ocean Territories and Siachen stay off, as they are
 * left off on purpose everywhere else.
 */
import { projectPoint } from "./project.ts";
import type { ChizuMap, ChizuRegion } from "./types.ts";

/**
 * One small country: its code, three-letter code, names, reading and continent, where it is (longitude then latitude),
 * the codes it shares a border with that the world draws, and its short Japanese name where it has one.
 */
type SmallState = readonly [
  code: string,
  iso3: string,
  name: string,
  nameJa: string,
  reading: string,
  group: string,
  lon: number,
  lat: number,
  neighbors: readonly string[],
  nameShortJa?: string,
];

/** A dot's radius on the 1000-wide canvas: a little over three screen pixels across on a phone, and it grows with the zoom. */
const DOT_RADIUS = 1.8;

/** How many sides the dot is drawn with: the engine's regions are polygons, and ten is round at this size. */
const DOT_SIDES = 10;

const SMALL_STATES: readonly SmallState[] = [
  ["AD", "AND", "Andorra", "アンドラ", "アンドラ", "Europe", 1.56, 42.54, ["ES", "FR"]],
  [
    "AG",
    "ATG",
    "Antigua & Barbuda",
    "アンティグア・バーブーダ",
    "アンティグアバーブーダ",
    "North America",
    -61.79,
    17.08,
    [],
  ],
  ["AI", "AIA", "Anguilla", "アンギラ", "アンギラ", "North America", -63.06, 18.22, []],
  ["AS", "ASM", "American Samoa", "米領サモア", "べいりょうさもあ", "Oceania", -170.72, -14.31, []],
  ["AW", "ABW", "Aruba", "アルバ", "アルバ", "North America", -69.98, 12.52, []],
  ["AX", "ALA", "Åland Islands", "オーランド諸島", "おーらんどしょとう", "Europe", 19.94, 60.23, []],
  ["BB", "BRB", "Barbados", "バルバドス", "バルバドス", "North America", -59.56, 13.18, []],
  ["BH", "BHR", "Bahrain", "バーレーン", "バーレーン", "Asia", 50.54, 26.04, []],
  ["BL", "BLM", "St. Barthélemy", "サン・バルテルミー", "サンバルテルミー", "North America", -62.84, 17.9, []],
  ["BM", "BMU", "Bermuda", "バミューダ", "バミューダ", "North America", -64.75, 32.31, []],
  ["CK", "COK", "Cook Islands", "クック諸島", "くっくしょとう", "Oceania", -159.79, -21.22, []],
  ["CV", "CPV", "Cape Verde", "カーボベルデ", "カーボベルデ", "Africa", -23.64, 15.08, []],
  ["CW", "CUW", "Curaçao", "キュラソー", "キュラソー", "North America", -68.97, 12.19, []],
  ["DM", "DMA", "Dominica", "ドミニカ国", "どみにかこく", "North America", -61.36, 15.44, []],
  ["FM", "FSM", "Micronesia", "ミクロネシア連邦", "みくろねしあれんぽう", "Oceania", 158.23, 6.88, []],
  ["FO", "FRO", "Faroe Islands", "フェロー諸島", "ふぇろーしょとう", "Europe", -6.88, 62.17, []],
  ["GD", "GRD", "Grenada", "グレナダ", "グレナダ", "North America", -61.68, 12.12, []],
  ["GG", "GGY", "Guernsey", "ガーンジー", "ガーンジー", "Europe", -2.57, 49.47, []],
  [
    "GS",
    "SGS",
    "South Georgia & South Sandwich Islands",
    "サウスジョージア・サウスサンドウィッチ諸島",
    "さうすじょーじあさうすさんどうぃっちしょとう",
    "South America",
    -36.69,
    -54.36,
    [],
  ],
  ["GU", "GUM", "Guam", "グアム", "グアム", "Oceania", 144.77, 13.44, []],
  ["HK", "HKG", "Hong Kong", "中華人民共和国香港特別行政区", "ほんこん", "Asia", 114.14, 22.44, ["CN"], "香港"],
  [
    "HM",
    "HMD",
    "Heard & McDonald Islands",
    "ハード島・マクドナルド諸島",
    "はーどとうまくどなるどしょとう",
    "Oceania",
    73.52,
    -53.09,
    [],
  ],
  ["IM", "IMN", "Isle of Man", "マン島", "まんとう", "Europe", -4.54, 54.22, []],
  [
    "IO",
    "IOT",
    "British Indian Ocean Territory",
    "英領インド洋地域",
    "えいりょういんどようちいき",
    "Africa",
    72.45,
    -7.33,
    [],
  ],
  ["JE", "JEY", "Jersey", "ジャージー", "ジャージー", "Europe", -2.13, 49.22, []],
  ["KI", "KIR", "Kiribati", "キリバス", "キリバス", "Oceania", -157.37, 1.86, []],
  ["KM", "COM", "Comoros", "コモロ", "コモロ", "Africa", 43.34, -11.66, []],
  [
    "KN",
    "KNA",
    "St. Kitts & Nevis",
    "セントクリストファー・ネーヴィス",
    "セントクリストファーネーヴィス",
    "North America",
    -62.75,
    17.33,
    [],
  ],
  ["KY", "CYM", "Cayman Islands", "ケイマン諸島", "けいまんしょとう", "North America", -81.28, 19.32, []],
  ["LC", "LCA", "St. Lucia", "セントルシア", "セントルシア", "North America", -60.97, 13.89, []],
  ["LI", "LIE", "Liechtenstein", "リヒテンシュタイン", "リヒテンシュタイン", "Europe", 9.53, 47.14, ["AT", "CH"]],
  ["MC", "MCO", "Monaco", "モナコ", "モナコ", "Europe", 7.41, 43.75, ["FR"]],
  ["MF", "MAF", "St. Martin", "サン・マルタン", "サンマルタン", "North America", -63.06, 18.09, ["SX"]],
  ["MH", "MHL", "Marshall Islands", "マーシャル諸島", "まーしゃるしょとう", "Oceania", 171.19, 7.1, []],
  ["MO", "MAC", "Macao", "中華人民共和国マカオ特別行政区", "マカオ", "Asia", 113.51, 22.22, ["CN"], "マカオ"],
  ["MP", "MNP", "Northern Mariana Islands", "北マリアナ諸島", "きたまりあなしょとう", "Oceania", 145.74, 15.18, []],
  ["MS", "MSR", "Montserrat", "モントセラト", "モントセラト", "North America", -62.18, 16.74, []],
  ["MT", "MLT", "Malta", "マルタ", "マルタ", "Europe", 14.44, 35.89, []],
  ["MU", "MUS", "Mauritius", "モーリシャス", "モーリシャス", "Africa", 57.57, -20.28, []],
  ["MV", "MDV", "Maldives", "モルディブ", "モルディブ", "Asia", 73.5, 4.2, []],
  ["NF", "NFK", "Norfolk Island", "ノーフォーク島", "のーふぉーくとう", "Oceania", 167.95, -29.05, []],
  ["NR", "NRU", "Nauru", "ナウル", "ナウル", "Oceania", 166.93, -0.52, []],
  ["NU", "NIU", "Niue", "ニウエ", "ニウエ", "Oceania", -169.87, -19.05, []],
  ["PF", "PYF", "French Polynesia", "仏領ポリネシア", "ふつりょうぽりねしあ", "Oceania", -149.42, -17.66, []],
  [
    "PM",
    "SPM",
    "St. Pierre & Miquelon",
    "サンピエール島・ミクロン島",
    "さんぴえーるとうみくろんとう",
    "North America",
    -56.33,
    46.95,
    [],
  ],
  ["PN", "PCN", "Pitcairn", "ピトケアン諸島", "ぴとけあんしょとう", "Oceania", -128.32, -24.36, []],
  ["PW", "PLW", "Palau", "パラオ", "パラオ", "Oceania", 134.58, 7.51, []],
  ["SC", "SYC", "Seychelles", "セーシェル", "セーシェル", "Africa", 55.48, -4.66, []],
  ["SG", "SGP", "Singapore", "シンガポール", "シンガポール", "Asia", 103.82, 1.36, []],
  ["SH", "SHN", "St. Helena", "セントヘレナ", "セントヘレナ", "Africa", -5.72, -15.96, []],
  ["SM", "SMR", "San Marino", "サンマリノ", "サンマリノ", "Europe", 12.46, 43.94, ["IT"]],
  ["ST", "STP", "São Tomé & Príncipe", "サントメ・プリンシペ", "サントメプリンシペ", "Africa", 6.61, 0.24, []],
  ["SX", "SXM", "Sint Maarten", "シント・マールテン", "シントマールテン", "North America", -63.06, 18.05, ["MF"]],
  [
    "TC",
    "TCA",
    "Turks & Caicos Islands",
    "タークス・カイコス諸島",
    "たーくすかいこすしょとう",
    "North America",
    -71.74,
    21.81,
    [],
  ],
  ["TO", "TON", "Tonga", "トンガ", "トンガ", "Oceania", -175.22, -21.17, []],
  ["TV", "TUV", "Tuvalu", "ツバル", "ツバル", "Oceania", 179.21, -8.5, []],
  ["VA", "VAT", "Vatican City", "バチカン市国", "ばちかんしこく", "Europe", 12.44, 41.91, ["IT"]],
  [
    "VC",
    "VCT",
    "St. Vincent & Grenadines",
    "セントビンセント及びグレナディーン諸島",
    "せんとびんせんとおよびぐれなでぃーんしょとう",
    "North America",
    -61.19,
    13.25,
    [],
  ],
  [
    "VG",
    "VGB",
    "British Virgin Islands",
    "英領ヴァージン諸島",
    "えいりょうゔぁーじんしょとう",
    "North America",
    -64.62,
    18.42,
    [],
  ],
  [
    "VI",
    "VIR",
    "U.S. Virgin Islands",
    "米領ヴァージン諸島",
    "べいりょうゔぁーじんしょとう",
    "North America",
    -64.77,
    17.74,
    [],
  ],
  ["WF", "WLF", "Wallis & Futuna", "ウォリス・フツナ", "ウォリスフツナ", "Oceania", -178.13, -14.28, []],
  ["WS", "WSM", "Samoa", "サモア", "サモア", "Oceania", -172.44, -13.63, []],
];

/** A number to the hundredth, as the world's data writes its coordinates. */
const hundredth = (value: number): number => Math.round(value * 100) / 100;

const num = (value: number): string => String(hundredth(value));

/** The path of a round dot of the given radius at a point on the canvas, in the world's own format. */
function dotPath(x: number, y: number): string {
  const points: string[] = [];
  for (let side = 0; side < DOT_SIDES; side += 1) {
    const angle = (side / DOT_SIDES) * 2 * Math.PI;
    points.push(`${num(x + DOT_RADIUS * Math.cos(angle))},${num(y + DOT_RADIUS * Math.sin(angle))}`);
  }
  return `M${points.join("L")}Z`;
}

const made = new WeakMap<object, unknown>();

/** What `withSmallStates` reads of a map: its regions, and which map it is. */
type SmallStatesMap = Pick<ChizuMap, "regions"> & Partial<Pick<ChizuMap, "id" | "kind" | "projection" | "source">>;

/**
 * The world with its smallest countries put back as dots. The 1:110m world has no outline for 62 of the 238 countries
 * (Singapore, Malta, Bahrain, most of the Caribbean and the Pacific); this adds each as a `small: true` region, a
 * small round shape at the middle of its largest island or piece, with its code, names, reading, continent and the
 * countries it touches. Every region the map already has is kept as it is and the dots come after them, so the world
 * is drawn, framed, labelled, called out and asked in a quiz as before, with the 62 as countries like any other. Only
 * the world (`id` `world`) and its finer drawing (`world-detail`) get dots: any other map, and a world cut down to a
 * group (`groupMap`), come back as they are, as does a world that already has every dot. The same map is returned
 * for the same input, and the map given is never changed.
 *
 * It is its own entry, so the table costs nothing until it is used. Draw or ask with the dots by giving the functions the
 * map it returns: `drawChizu(withSmallStates(WORLD))`, `findQuestion(withSmallStates(WORLD), "SG", random)`,
 * `pickDistractors(withSmallStates(WORLD), "SG")`. `mountChizu` (`smallStates: true`), `<chizu-map small-states>` and
 * `<chizu-quiz small-states>` fetch the entry themselves, only when that is on.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { withSmallStates } from "@johnmorrisdotca/chizu/small-states";
 *
 * const withDots = withSmallStates(WORLD);
 * const singapore = withDots.regions.find((region) => region.code === "SG")!;
 * console.log(WORLD.regions.length, withDots.regions.length, singapore.small, singapore.nameJa);
 * // 173 235 true シンガポール
 * ```
 *
 * @param map - The world map, or its finer drawing; any other map is returned unchanged.
 * @returns The map with a dot added for each small country it does not draw, or `map` itself when there is nothing to add.
 */
export function withSmallStates<M extends SmallStatesMap>(map: M): M {
  const known = made.get(map);
  if (known) return known as M;
  if ((map.id !== "world" && map.id !== "world-detail") || map.kind !== "world" || map.projection?.kind !== "miller")
    return map;
  const projection = map.projection!;
  const have = new Set(map.regions.map((region) => region.code));
  const groupJa = new Map<string, string>();
  for (const region of map.regions) if (region.groupJa) groupJa.set(region.group, region.groupJa);
  const added = new Set(SMALL_STATES.map((state) => state[0]));
  const dots: ChizuRegion[] = [];
  for (const [code, iso3, name, nameJa, reading, group, lon, lat, neighbors, nameShortJa] of SMALL_STATES) {
    if (have.has(code)) continue;
    const at = projectPoint({ projection }, lon, lat);
    if (!at) continue;
    const x = hundredth(at[0]);
    const y = hundredth(at[1]);
    const groupName = groupJa.get(group);
    dots.push({
      code,
      name,
      nameJa,
      ...(nameShortJa ? { nameShortJa } : {}),
      reading,
      group,
      ...(groupName ? { groupJa: groupName } : {}),
      small: true,
      iso3,
      path: dotPath(x, y),
      bbox: [
        hundredth(x - DOT_RADIUS),
        hundredth(y - DOT_RADIUS),
        hundredth(x + DOT_RADIUS),
        hundredth(y + DOT_RADIUS),
      ],
      centroid: [x, y],
      neighbors: neighbors.filter((other) => have.has(other) || added.has(other)),
    });
  }
  if (dots.length === 0) return map;
  const withDots = {
    ...map,
    regions: [...map.regions, ...dots],
    source: `${map.source ?? "world"}; ${dots.length} smaller countries as dots`,
  } as M;
  made.set(map, withDots);
  return withDots;
}

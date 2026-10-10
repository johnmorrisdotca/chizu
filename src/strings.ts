import type { ChizuFeature, ChizuFeatureKind, ChizuRegion } from "./types.ts";

/**
 * THE WORDS chizu says itself, in English and Japanese: what a screen reader hears of a drawing, and the labels on a
 * mounted map's buttons. Plain data, so a page can read them, replace a few or add a language of its own beside these
 * two. `{name}` in a line is a value filled in.
 *
 * @example
 * ```ts
 * import { nameOf, type ChizuLanguage } from "@johnmorrisdotca/chizu";
 *
 * const language: ChizuLanguage = "ja";
 * console.log(nameOf({ name: "Japan", nameJa: "日本" }, language));
 * // 日本
 * ```
 */
export type ChizuLanguage = "en" | "ja";

/**
 *
 * @example
 * ```ts
 * import { CHIZU_STRINGS } from "@johnmorrisdotca/chizu";
 *
 * console.log(Object.keys(CHIZU_STRINGS).join(" "), CHIZU_STRINGS.en.zoomIn, CHIZU_STRINGS.ja.zoomIn);
 * // en ja Zoom in 拡大
 * ```
 */
export const CHIZU_STRINGS: Record<ChizuLanguage, Record<string, string>> = {
  en: {
    map: "Map of {name}",
    mapOfRegions: "Map of {name}, {n} regions",
    region: "{name}",
    regionOf: "{name}, {kind}",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    zoomWhole: "Show the whole map",
    zoomLevel: "{n}×",
    selected: "{name} chosen",
    none: "Nothing chosen",
    keys: "Drag to move, the plus and minus buttons zoom (or Ctrl and the wheel), arrow keys move, plus and minus zoom, 0 shows the whole map.",
    callout: "Number {n}: {name}",
    inset: "{name}, drawn in a box of its own",
    feature: "{name}, {kind}",
    "kind.ocean": "Ocean",
    "kind.sea": "Sea",
    "kind.gulf": "Gulf",
    "kind.bay": "Bay",
    "kind.strait": "Strait",
    "kind.channel": "Channel",
    "kind.sound": "Sound",
    "kind.fjord": "Fjord",
    "kind.inlet": "Inlet",
    "kind.lagoon": "Lagoon",
    "kind.reef": "Reef",
    "kind.lake": "Lake",
    "kind.reservoir": "Reservoir",
    "kind.river": "River",
    "kind.desert": "Desert",
    "kind.range": "Mountain range",
    "kind.plateau": "Plateau",
    "kind.plain": "Plain",
    "kind.peninsula": "Peninsula",
    "kind.cape": "Cape",
    "kind.basin": "Basin",
    "kind.delta": "Delta",
    "kind.valley": "Valley",
    "kind.wetland": "Wetland",
    "kind.tundra": "Tundra",
    "kind.isthmus": "Isthmus",
    "kind.depression": "Depression",
    "kind.lowland": "Lowland",
    "kind.gorge": "Gorge",
    "kind.foothills": "Foothills",
    "kind.peak": "Peak",
    "kind.capital": "Capital",
    "kind.seat": "Seat of government",
    "kind.seat.JP": "Prefectural capital",
  },
  ja: {
    map: "{name}の地図",
    mapOfRegions: "{name}の地図、{n}か所",
    region: "{name}",
    regionOf: "{name}（{kind}）",
    zoomIn: "拡大",
    zoomOut: "縮小",
    zoomWhole: "全体を表示",
    zoomLevel: "{n}倍",
    selected: "{name}を選びました",
    none: "何も選んでいません",
    keys: "ドラッグで動かし、プラスとマイナスのボタン（またはCtrlを押しながらホイール）で拡大縮小、矢印キーで動かし、プラスとマイナスのキーで拡大縮小、0で全体を表示します。",
    callout: "{n}番：{name}",
    inset: "{name}、別枠に描いています",
    feature: "{name}（{kind}）",
    "kind.ocean": "大洋",
    "kind.sea": "海",
    "kind.gulf": "湾",
    "kind.bay": "湾",
    "kind.strait": "海峡",
    "kind.channel": "海峡",
    "kind.sound": "湾",
    "kind.fjord": "フィヨルド",
    "kind.inlet": "入り江",
    "kind.lagoon": "潟湖",
    "kind.reef": "サンゴ礁",
    "kind.lake": "湖",
    "kind.reservoir": "貯水池",
    "kind.river": "川",
    "kind.desert": "砂漠",
    "kind.range": "山脈",
    "kind.plateau": "高原",
    "kind.plain": "平野",
    "kind.peninsula": "半島",
    "kind.cape": "岬",
    "kind.basin": "盆地",
    "kind.delta": "三角州",
    "kind.valley": "谷",
    "kind.wetland": "湿地",
    "kind.tundra": "ツンドラ",
    "kind.isthmus": "地峡",
    "kind.depression": "くぼ地",
    "kind.lowland": "低地",
    "kind.gorge": "峡谷",
    "kind.foothills": "山麓",
    "kind.peak": "山",
    "kind.capital": "首都",
    "kind.seat": "行政の中心地",
    "kind.seat.JP": "県庁所在地",
  },
};

/**
 * A language this package has words for, from a tag such as `ja-JP` or `en`: Japanese for any `ja`, English otherwise.
 *
 * @example
 * ```ts
 * import { chizuLanguageOf } from "@johnmorrisdotca/chizu";
 *
 * console.log(chizuLanguageOf("ja-JP"), chizuLanguageOf("fr"), chizuLanguageOf(undefined));
 * // ja en en
 * ```
 */
export function chizuLanguageOf(tag: string | undefined | null): ChizuLanguage {
  return String(tag ?? "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

/**
 * A line of the board's words with its `{name}` values filled in.
 *
 * @example
 * ```ts
 * import { chizuSay } from "@johnmorrisdotca/chizu";
 *
 * console.log(chizuSay("en", "map", { name: "Japan" }));
 * console.log(chizuSay("ja", "map", { name: "日本" }));
 * // Map of Japan
 * // 日本の地図
 * ```
 */
export function chizuSay(language: ChizuLanguage, key: string, values: Record<string, string | number> = {}): string {
  const line = CHIZU_STRINGS[language][key] ?? CHIZU_STRINGS.en[key] ?? key;
  return line.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/**
 * What a region is called in a language: the English name, or in Japanese the everyday short name where there is one
 * (アメリカ), else the full Japanese name, else the English.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { nameOf } from "@johnmorrisdotca/chizu";
 *
 * const us = WORLD.regions.find((region) => region.code === "US")!;
 * console.log(nameOf(us, "en"), nameOf(us, "ja"));
 * // United States アメリカ
 * ```
 */
export function nameOf(region: Pick<ChizuRegion, "name" | "nameJa" | "nameShortJa">, language: ChizuLanguage): string {
  return language === "ja" ? (region.nameShortJa ?? region.nameJa ?? region.name) : region.name;
}

/**
 * What a kind of feature is called, in a language: `Sea` and 海, `Mountain range` and 山脈. From `CHIZU_STRINGS`
 * (`kind.sea`), so a page can replace one.
 *
 * @example
 * ```ts
 * import { featureKindName } from "@johnmorrisdotca/chizu";
 *
 * console.log(featureKindName("strait", "en"), featureKindName("strait", "ja"), featureKindName("range", "ja"));
 * // Strait 海峡 山脈
 * ```
 */
export function featureKindName(kind: ChizuFeatureKind, language: ChizuLanguage): string {
  return chizuSay(language, `kind.${kind}`);
}

/**
 * What a feature is called as a kind, on the map it is drawn on: `featureKindName`, except that a kind may have a word
 * of its own in one country, written `kind.<kind>.<COUNTRY>` in `CHIZU_STRINGS` and read from the country in a seat's
 * code (`seat-JP-47`). A region's seat is a 行政の中心地 everywhere, and a 県庁所在地 on a map of Japan's prefectures.
 *
 * @example
 * ```ts
 * import { featureKindOf } from "@johnmorrisdotca/chizu";
 *
 * console.log(featureKindOf({ kind: "seat", code: "seat-JP-47" }, "ja"), featureKindOf({ kind: "seat", code: "seat-US-TX" }, "ja"));
 * // 県庁所在地 行政の中心地
 * ```
 */
export function featureKindOf(feature: Pick<ChizuFeature, "kind" | "code">, language: ChizuLanguage): string {
  const country = /^seat-([A-Z]{2})-/.exec(feature.code)?.[1];
  const key = country ? `kind.${feature.kind}.${country}` : undefined;
  return key && (CHIZU_STRINGS[language][key] ?? CHIZU_STRINGS.en[key]) ? chizuSay(language, key) : featureKindName(feature.kind, language);
}

import type { ChizuRegion } from "./types.ts";

/**
 * THE WORDS chizu says itself, in English and Japanese: what a screen reader hears of a drawing, and the labels on a
 * mounted map's buttons. Plain data, so a page can read them, replace a few or add a language of its own beside these
 * two. `{name}` in a line is a value filled in.
 */
export type ChizuLanguage = "en" | "ja";

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
  },
};

/** A language this package has words for, from a tag such as `ja-JP` or `en`: Japanese for any `ja`, English otherwise. */
export function chizuLanguageOf(tag: string | undefined | null): ChizuLanguage {
  return String(tag ?? "").toLowerCase().startsWith("ja") ? "ja" : "en";
}

/** A line of the board's words with its `{name}` values filled in. */
export function chizuSay(language: ChizuLanguage, key: string, values: Record<string, string | number> = {}): string {
  const line = CHIZU_STRINGS[language][key] ?? CHIZU_STRINGS.en[key] ?? key;
  return line.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/**
 * What a region is called in a language: the English name, or in Japanese the everyday short name where there is one
 * (アメリカ), else the full Japanese name, else the English.
 */
export function nameOf(region: Pick<ChizuRegion, "name" | "nameJa" | "nameShortJa">, language: ChizuLanguage): string {
  return language === "ja" ? (region.nameShortJa ?? region.nameJa ?? region.name) : region.name;
}

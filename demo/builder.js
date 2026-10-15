import { VERSION } from "./dist/index.js";
import { CHIZU_ELEMENT_OPTION_KEYS, ChizuMapElement, ChizuLocator, ChizuQuiz, readMapData, readMapColors } from "./dist/element.js";
import "./dist/element-define.js";
import { CHIZU_COUNTRIES } from "./dist/names-entry.js";
import { choices } from "./embed-options.js";
import { familyEmbedBuilder, FAMILY_EMBED_BUILDER_WORDS } from "./family-embed-builder.js";
const words = {
  en: {
    ...FAMILY_EMBED_BUILDER_WORDS.en,
    pageDocs: "Docs",
    pageApi: "API",
    pitch: "Choose a map, locate a place or build a geography quiz, then copy the code for your page.",
    name: "Chizu means map in Japanese.",
    nameLink: "About the name",
    foot: "The setup is in the link. No location, game or personal data is stored.",
    toGallery: "The maps",
    makerMap: "A map",
    makerLocator: "A locator",
    makerQuiz: "A quiz",
    makerMapSays: "Highlight places or shade them from your figures.",
    makerLocatorSays: "Locate a named feature or latitude,longitude pair.",
    makerQuizSays: "The same seed gives the same geography questions.",
    copyLink: "Copy a link to this setup",
    badColors: "Use code:colour pairs, such as JP:#2f6b4f,GB:#8a3b3b.",
    badData: "Use a JSON object of finite figures, such as {\"JP\":10,\"CA\":20}."
  },
  ja: {
    ...FAMILY_EMBED_BUILDER_WORDS.ja,
    pageDocs: "ドキュメント",
    pageApi: "API（英語）",
    pitch: "地図、場所の表示、地理クイズを選んで、ページに埋め込むコードをコピーできます。",
    name: "「地図」は英語の map に当たる日本語です。",
    nameLink: "名前について",
    foot: "設定はリンクに入ります。位置情報、ゲーム、個人情報は保存しません。",
    toGallery: "地図の一覧",
    makerMap: "地図",
    makerLocator: "場所の表示",
    makerQuiz: "クイズ",
    makerMapSays: "場所を強調したり、自分の数値で色分けしたりします。",
    makerLocatorSays: "名前のある場所、または緯度・経度を表示します。",
    makerQuizSays: "同じシードで同じ地理の問題が出ます。",
    copyLink: "この設定へのリンクをコピー",
    badColors: "JP:#2f6b4f,GB:#8a3b3bのように、地域コードと色を指定してください。",
    badData: "{\"JP\":10,\"CA\":20} のように、地域コードと数値をJSONで指定してください。"
  },
};
const all = (name) => ({ map: name, locator: name, quiz: name });
const row = (id, kind, names, en, ja, extra = {}) => ({ id, kind, group: "map", names, say: { en: { label: en[0], help: en[1] }, ja: { label: ja[0], help: ja[1] } }, ...extra });
const options = [
  row("region", "choice", all("region"), ["Map", "The world, a country's regions or a country alone."], ["地図", "世界、国の行政区画、または1つの国だけを表示します。"], { choices: choices.region, default: "world", control: "select", choiceLabels: { ja: Object.fromEntries(choices.region.map(value => { if (value === "world") return [value, "世界"]; const code = value.split("-")[1].toUpperCase(); const country = CHIZU_COUNTRIES.find(one => one.code === code); return [value, `${country?.nameJa ?? code}${value.startsWith("divisions-") ? "の行政区画" : ""}`]; })) } }),
  row("size", "choice", all("size"), ["Display size", "Small, medium or large."], ["表示の大きさ", "小・中・大を選びます。"], { choices: choices.size, default: "medium" }),
  row("width", "number", all("width"), ["Width", "The element's width in pixels; it fits a narrower page."], ["幅", "表示の幅をピクセルで指定します。狭いページにも収まります。"], { range: { min: 100, max: 2000, step: 10 } }),
  row("theme", "choice", all("theme"), ["Theme", "Light, dark or the device's preference."], ["配色", "明るい配色・暗い配色、または端末の設定に合わせます。"], { choices: choices.theme, default: "auto" }),
  row("lang", "choice", all("lang"), ["Language", "The language of the names and controls."], ["言語", "名前と操作ボタンの言語です。"], { choices: choices.lang }),
  row("label", "text", all("label"), ["Spoken label", "An optional label for a screen reader."], ["読み上げる名前", "スクリーンリーダー用の名前です。指定は任意です。"]),
  row("features", "choice", all("features"), ["Features", "Named water, all features, or none."], ["地物", "名前のある水域（河川・湖など）、すべての地物、または表示なしです。"], { choices: choices.features, default: "none" }),
  row("colors", "text", all("colors"), ["Colours per place", "Comma-separated code:colour pairs, for example JP:#2f6b4f,GB:#8a3b3b. Unlisted places keep the theme colour."], ["場所ごとの色", "JP:#2f6b4f,GB:#8a3b3bのように、地域コードと色をカンマで区切ります。指定のない場所は配色の色を使います。"]),
  row("capital", "boolean", { map: "capital", locator: "capital" }, ["Show capitals", "Add capital markers. Turn off to omit them even with all features selected."], ["首都を表示", "首都の点を表示します。オフにすると、すべての地物を選んでも首都の点を表示しません。"], { default: true }),
  row("labels", "boolean", all("labels"), ["Labels", "Print names on the map."], ["名前", "地図に名前を表示します。"], { default: false }),
  row("controls", "boolean", all("controls"), ["Zoom controls", "Show the zoom buttons."], ["拡大・縮小ボタン", "拡大・縮小のボタンを表示します。"], { default: true }),
  row("zoom", "number", { map: "zoom", locator: "zoom" }, ["Zoom", "A zoom step from one to ten."], ["拡大", "1から10までの拡大の段階です。"], { default: 1, range: { min: 1, max: 10, step: 1 } }),
  row("highlight", "text", { map: "highlight" }, ["Highlight", "Region or ISO codes separated by spaces."], ["強調する場所", "地域コード、またはISOコードを空白で区切ります。"]),
  row("data", "text", { map: "data" }, ["Figures", "A JSON object keyed by region or ISO code."], ["数値", "地域コード、またはISOコードと数値をJSONで指定します。"]),
  row("selectable", "boolean", { map: "selectable" }, ["Choose places", "Allow taps and a keyboard list to choose a place."], ["場所を選ぶ", "タップとキーボード用の一覧で場所を選べます。"], { default: true }),
  row("place", "text", { locator: "place" }, ["Place", "A feature id on the map, such as Q200239 on country-jp, or latitude,longitude."], ["場所", "地物ID（country-jpならQ200239など）、または緯度・経度です。"], { default: "35.69,139.69" }),
  row("seed", "number", { quiz: "seed" }, ["Seed", "The same seed gives the same questions."], ["シード", "同じシードで同じ問題が出ます。"], { default: 1, range: { min: 0, max: 4294967295, step: 1 } }),
];
const leftOut = { "options.colors": "The colours control writes colors.", "options.capital": "The capital switch writes capital.", "options.onSelect": "Native callbacks belong to host options; the element also dispatches composed events.", "options.onView": "Native view callbacks belong to host options; the element also dispatches composed events.", "options.features": "The features control writes features; custom group and kind lists belong to host code.", "options.map": "Custom map data belongs to the host; built-in maps are selected by region.", "options.featureLayer": "The static builder loads each map's built-in layer locally.", "options.detail": "Custom high-detail loaders belong to host code.", "options.detailFrom": "A custom detail loader's threshold belongs to host code.", "options.callouts": "Printed callout layout is configured in the map API and demo.", "options.fit": "Map selections and named locator features use the existing automatic fit.", "options.tones": "The builder exposes highlights and numeric data; custom tone classes belong to the host.", "options.selected": "The builder starts with no selected place; the locator uses place.", "options.featureLabels": "Feature names use the mounted-map default.", "options.language": "The language control writes lang.", "options.data": "The figures control writes data.", "options.labels": "The labels control writes labels.", "options.controls": "The controls switch writes controls.", "options.selectable": "The selection switch writes selectable.", "options.zoom": "The zoom control writes zoom." };
const formats = ["element", "iframe", "module", "react", "vue", "svelte", "angular", "html", "url"];
let mounted;
const mapRatios = { world: 489 / 1000 };
const frameExtras = {};
const frameKey = (maker, settings) => `${maker}:${JSON.stringify(settings)}`;
const page = globalThis.familyLanguage({ id: "chizu", words, onChange: () => { docsLink(); mounted?.draw(); } });
const makers = Object.fromEntries(["map", "locator", "quiz"].map((kind) => [kind, { names: kind, element: kind, tag: `chizu-${kind}`, embed: kind === "map" ? "embed/" : `embed/${kind}/`, required: ["region", ...(kind === "locator" ? ["place"] : [])], description: `maker${kind[0].toUpperCase()}${kind.slice(1)}Says`, formats, width: 720, height: (settings) => Math.ceil(Math.min(Number(settings.width) || ({ small: 320, medium: 480, large: 720 }[settings.size] ?? 480), 704) * (mapRatios[settings.region ?? "world"] ?? 489 / 1000)) + (frameExtras[frameKey(kind, settings)] ?? (kind === "quiz" ? 380 : kind === "map" ? 150 : 100)) }]));
const builder = familyEmbedBuilder({ id: "chizu", packageName: "@johnmorrisdotca/chizu", major: VERSION.split(".")[0], site: "https://johnmorrisdotca.github.io/chizu/", title: "Chizu · maps", titleJa: "地図の埋め込み", options, leftOut, makers, groups: { map: { en: "The map", ja: "地図の設定" } }, code: ({ maker, format, settings }) => {
  if (readMapColors(settings.colors ?? null) === null) return null;
  if (maker === "map" && readMapData(settings.data ?? null) === null) return null;
  if ((format === "iframe" || format === "url") && settings.lang === undefined) return builder.codeFor(maker, format, options, { ...settings, lang: page.lang });
  return undefined;
} });
builder.validateCoverage({ map: ChizuMapElement.observedAttributes, locator: ChizuLocator.observedAttributes, quiz: ChizuQuiz.observedAttributes, options: CHIZU_ELEMENT_OPTION_KEYS });
mounted = builder.mount({ words, language: () => page, initial: { map: { region: "world", lang: page.lang }, locator: { region: "world", place: "35.69,139.69", lang: page.lang }, quiz: { region: "world", lang: page.lang } }, renderPreview: ({ stage, maker, settings, attrs, note, say }) => {
  if (readMapColors(settings.colors ?? null) === null) { note.textContent = say("badColors"); return { destroy() {} }; }
  if (maker === "map" && readMapData(settings.data ?? null) === null) { note.textContent = say("badData"); return { destroy() {} }; }
  const element = globalThis.document.createElement(`chizu-${maker}`);
  for (const [name, value] of attrs) element.setAttribute(name, value);
  element.addEventListener("chizu-load", (event) => { mapRatios[settings.region ?? "world"] = event.detail.height / event.detail.width; const map = element.shadowRoot.querySelector(".czm-stage"); frameExtras[frameKey(maker, settings)] = Math.ceil(element.getBoundingClientRect().height - (map?.getBoundingClientRect().height ?? 0)) + 16; mounted?.refreshCode(); });
  stage.append(element);
  return { destroy() { element.remove(); } };
} });

function docsLink(){document.querySelector('[data-say="pageDocs"]')?.setAttribute("href",page.lang==="ja"?"docs/ja/index.html":"docs/index.html");}
docsLink();

// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Chizu's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { build } from "esbuild";

import { API_CSS, apiPage } from "./api.mjs";
import {
  FAMILY_EMBED_BUILDER_WORDS,
  FAMILY_SCRIPT,
  familyEmbedBuilder,
  familyFooter,
  familyHead,
  familyHeader,
  familyUnreviewed,
} from "./family-template.mjs";
import { publishThumbnails, thumbnailHead } from "./family-thumbnail.mjs";

const id = "chizu";
const ALT =
  "Chizu: the world with Japan in the middle, each continent in a colour of its own, drawn as SVG from Natural Earth outlines.";
const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='72' font-size='64' text-anchor='middle' fill='%23f3efe4'%3E図%3C/text%3E%3C/svg%3E";

const uses = [
  `import WORLD from "@johnmorrisdotca/chizu/world";  import { drawChizu } from "@johnmorrisdotca/chizu/draw";`,
  `drawChizu(WORLD, { tones: { JP: "selected" }, language: "ja" })  // the world as SVG text, Japan lit, names in Japanese`,
  `const spots = layoutCallouts(WORLD, { codes: ["JP", "BR", "EG", "AU"], radiusRatio: 0.02 })  // numbered circles in open water, leaders that never cross`,
  `const q = findQuestion(WORLD, "FR", seededRandom(7))  // { target: "FR", choices: ["BE", "FR", "DE", "CH"], answerIndex: 1 }`,
  `const japan = await loadDivisions("jp")  // the 47 prefectures, named and read (東京都, とうきょうと), ISO codes JP-01 to JP-47`,
  `const africa = groupMap(WORLD, CHIZU_CONTINENTS.find((c) => c.code === "AF").codes)  // a continent, for a quiz or callouts within it`,
  `const water = await loadFeatures("divisions-jp")  // Japan's seas, lakes and rivers on its own canvas: 瀬戸内海 (せとないかい), Lake Biwa`,
  `drawChizu(WORLD, { features: ["water"], featureLayer: await loadFeatures("world"), tones: { Q5484: "selected" } })  // the world's water, the Caspian lit`,
  `drawLocal(localMap({ centre: [139.7006, 35.7004], widthMetres: 400, data: geojson, markers, credits }))  // a venue past the 10× step: your GeoJSON and pictures, true metres, nothing fetched`,
  `projectPoint(WORLD, 139.69, 35.69)  // [x, y] of Tokyo on the world's canvas, to pin a member there`,
  `mountChizu(element, { map: WORLD, onSelect: (code) => … })  // a map to drag, zoom and press, by touch, mouse and keyboard`,
];
const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const row = (testid, label, help) =>
  `<div class="setup fam-row" data-help-en="${escapeHtml(help[0])}" data-help-ja="${escapeHtml(help[1])}"><span class="fam-label" data-say="${label}"></span><div class="fam-seg" role="group" data-say-label="${label}" id="${testid}" data-testid="${testid}"></div></div>`;

// The page is demo/index.html; each <!-- family:key --> in it is replaced by the text below.
const pageParts = {
  head: familyHead({
    id,
    title: "Chizu 地図 — SVG maps for JavaScript",
    description:
      "Japan's 47 prefectures, the world, its continents and 32 countries' regions, with their seas, lakes, rivers and mountains: pan and zoom, play and share geography quizzes, print numbered callout sheets, and colour a map from your own figures. Natural Earth outlines, names in English and Japanese. Free and open source.",
    ogTitle: "Chizu maps",
    ogDescription:
      "Japan's prefectures, the world and 32 countries' regions: quizzes, callout sheets and coloured maps, in English and Japanese.",
  }),
  thumbnail: thumbnailHead(JSON.parse(readFileSync("package.json", "utf8")), { alt: ALT }),
  icon: ICON,
  header: familyHeader({
    id,
    links: [
      { href: "docs/index.html", say: "pageDocs" },
      { href: "api.html", say: "pageApi" },
    ],
  }),
  rowFeatures: row("features", "features", [
    "Draw the map's named water (its seas, bays and straits, lakes and rivers), its capitals (a country's capital, and on a map of its regions each region's seat), or everything named on it, deserts, mountain ranges and peaks too. Off, the map is as it always was. Each map's features are a file of their own, fetched the first time you turn them on.",
    "地図に、名前のある水（海、湾、海峡、湖、川）を重ねて描きます。「首都」にすると、国の首都と、地方の地図では各地方の中心地（日本では県庁所在地）を描きます。「すべて」にすると、砂漠、山脈、山など、名前のあるものをすべて描きます。「なし」なら、いつもの地図のままです。描くものは地図ごとに別のファイルで、はじめて表示するときに読み込みます。",
  ]),
  rowCities: row("cities", "cities", [
    "Name the cities on the world and on a country's own map: the biggest on the whole world, more as you zoom in, each name beside its dot where it covers no other. Off, the map is as it always was. The cities are kuni's, fetched the first time you turn them on. A map of a country's regions has no cities.",
    "世界地図と国の地図に、都市の名前を表示します。世界全体では大きな都市だけを表示し、拡大するほど多くの都市を表示します。名前は点の横の、ほかの名前に重ならない位置に置きます。「なし」なら、いつもの地図のままです。都市のデータはkuniのもので、はじめて「あり」にしたときに読み込みます。地方に分けた地図には都市を表示しません。",
  ]),
  rowOverlays: row("overlays", "overlays", [
    "Draw lines, a mark and a shaded area over the map from numbers: the night side as it is now, a sample satellite's last half orbit and its next one (unbroken across the date line), and where it is. The page works the numbers out; the map only draws them, and draws only them again when they change.",
    "数値から、線、点、塗りつぶした範囲を地図に重ねて描きます。いまの夜の側、例として人工衛星のさっきの半周と次の1周（日付変更線をまたいでも途切れません）、いまの位置です。数値はページが計算し、地図は描くだけです。数値が変わったときは、それだけを描き直します。",
  ]),
  rowModes: row("modes", "mode", [
    "Explore the map and read the names, play a quiz, see numbered callouts placed on it, or colour it from your own figures.",
    "地図を見てなまえを調べる、クイズで遊ぶ、番号つきの目印をつける、自分の数値で色を塗る、のどれかを選びます。",
  ]),
  rowStyles: row("styles", "style", [
    "Pick the lit place's name from four look-alikes, type its name in English or Japanese, type the reading of its name in kana, find a named place on the map, or find a named sea, lake or river. Ten questions a round, made from a seed: share the link and a friend gets the same ten.",
    "光っている場所のなまえを似たなまえ4つから選ぶ、英語か日本語でなまえを入力する、なまえの読みをかなで入力する、なまえを見て地図でさがす、海や湖や川を地図でさがす、のどれかを選びます。1回は10問で、問題はリンクに入っている番号で決まります。リンクを送れば、友だちにも同じ10問が出ます。",
  ]),
  rowPolish: row("polish", "polish", [
    "Off is the quick walk, fast enough to redraw on every move. On finishes with the slow pass a printed sheet gets: no two leaders closer than a circle's width, none through another number. It can take a few seconds.",
    "「なし」は速い配置で、動かすたびに描き直せます。「あり」は印刷用の仕上げで、引き出し線どうしを円の幅より近づけず、他の番号を通らないようにします。数秒かかることがあります。",
  ]),
  rowNumbering: row("numbering", "numbering", [
    "Number the regions in the order of the list, or as they run across the map from west to east.",
    "番号を、一覧の順につけるか、地図の西から東へ並ぶ順につけます。",
  ]),
  rowColourBy: row("colour-by", "colourBy", [
    "Shade the places from figures you paste, in five steps from the lowest to the highest, or give each of the map's parts a colour of its own.",
    "貼りつけた数値で、小さいものから大きいものまで5段階に塗るか、地図のグループ（大陸や地方など）ごとに色を分けます。",
  ]),
  rowCityScale: row("city-scale", "cityScale", [
    "Step from Japan's map at 10× down to a venue: 20 km, 2 km and 400 m across, each a local map of the same made-up ground. The red box on Japan's map is what the 20 km step covers.",
    "日本の10倍の地図から、幅20 km、2 km、400 mの順に、同じ架空の土地を拡大していきます。どれもその場所だけの地図です。日本の地図の赤い枠が、20 kmの段階の範囲です。",
  ]),
  rowCityNames: row("city-names", "cityNames", [
    "Print the names of the shapes that have one, where they fit.",
    "名前のある形の名前を、収まる場合だけ表示します。",
  ]),
  rowCityNumbers: row("city-numbers", "numbering", [
    "Number the hall, the pond, the north gate and the pitch with the callout placer.",
    "本館、池、北門、ピッチに、目印の番号をつけます。",
  ]),
  unreviewed: familyUnreviewed({ id }),
  uses: uses.map((line) => `<li><code>${escapeHtml(line)}</code></li>`).join("\n          "),
  footer: familyFooter({ id }),
  script: `<script>${FAMILY_SCRIPT}</script>\n    <script type="module" src="kazoku-parts.js"></script>`,
};
const page = readFileSync("demo/index.html", "utf8").replace(
  /<!-- family:([A-Za-z]+) -->/g,
  (_match, key) => pageParts[key],
);

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
// The declarations and source maps are for editors, not for a browser.
cpSync("dist", "site/dist", { recursive: true, filter: (from) => !/\.(d\.ts|map)$/.test(from) });
// The cities' entry needs kuni, which the page cannot import by name: bundled here, each of kuni's tiers a file of its own, fetched when asked for.
await build({
  entryPoints: { "kuni-cities": "dist/cities-entry.js" },
  outdir: "site/cities",
  bundle: true,
  splitting: true,
  format: "esm",
  minify: true,
  logLevel: "silent",
});
writeFileSync("site/index.html", page);
// The family's card, dark card and icon, at <site>/thumbnail.png, thumbnail-dark.png and icon.png.
publishThumbnails(".", "site");
// The family header's language picker and theme switch, as one small module for every page of the site (the demo, the builder, the API reference and the docs).
await build({
  stdin: {
    contents:
      'import "@johnmorrisdotca/kazoku-ui/language-picker/define";\nimport "@johnmorrisdotca/kazoku-ui/theme-switch/define";\n',
    resolveDir: process.cwd(),
  },
  outfile: "site/kazoku-parts.js",
  bundle: true,
  format: "esm",
  minify: true,
  logLevel: "silent",
});
// kazoku-ui's embed panel, for the builder's code section only.
await build({
  stdin: { contents: 'import "@johnmorrisdotca/kazoku-ui/embed-panel/define";\n', resolveDir: process.cwd() },
  outfile: "site/kazoku-embed-panel.js",
  bundle: true,
  format: "esm",
  minify: true,
  logLevel: "silent",
});
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Chizu", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");

for (const file of ["builder.js", "builder.css", "embed-options.js"]) cpSync(`demo/${file}`, `site/${file}`);
cpSync("demo/embed", "site/embed", { recursive: true });
writeFileSync(
  "site/family-embed-builder.js",
  `export const FAMILY_EMBED_BUILDER_WORDS = ${JSON.stringify(FAMILY_EMBED_BUILDER_WORDS)};\nexport ${familyEmbedBuilder.toString()};\n`,
);
const builderParts = {
  builderHead: familyHead({
    id,
    title: "Chizu 地図 — SVG maps for JavaScript",
    description: "Preview an embeddable map, named place or geography quiz and copy the code.",
  }),
  builderHeader: familyHeader({
    id,
    links: [
      { href: "./", say: "toGallery" },
      { href: "docs/index.html", say: "pageDocs" },
      { href: "api.html", say: "pageApi" },
    ],
  }),
  unreviewed: familyUnreviewed({ id }),
  footer: familyFooter({ id }),
  script: `<script>${FAMILY_SCRIPT}</script>\n    <script type="module" src="kazoku-parts.js"></script>`,
};
writeFileSync(
  "site/builder.html",
  readFileSync("demo/builder.html", "utf8").replace(/<!-- family:([A-Za-z]+) -->/g, (_match, key) => builderParts[key]),
);

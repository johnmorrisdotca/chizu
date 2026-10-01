// Builds the static demo for GitHub Pages into ./site: the page, written here from the family's
// shared header and footer, with the family's stylesheet, Chizu's own, the page's script and the
// compiled library beside it.
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";

import { API_CSS, apiPage } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "chizu";
const ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232f5d4a'/%3E%3Ctext x='50' y='72' font-size='64' text-anchor='middle' fill='%23f3efe4'%3E図%3C/text%3E%3C/svg%3E";

const uses = [
  `import WORLD from "@johnmorrisdotca/chizu/world";  import { drawChizu } from "@johnmorrisdotca/chizu/draw";`,
  `drawChizu(WORLD, { tones: { JP: "selected" }, language: "ja" })  // the world as SVG text, Japan lit, names in Japanese`,
  `const spots = layoutCallouts(WORLD, { codes: ["JP", "BR", "EG", "AU"], radiusRatio: 0.02 })  // numbered circles in open water, leaders that never cross`,
  `const q = findQuestion(WORLD, "FR", seededRandom(7))  // { target: "FR", choices: ["BE", "FR", "DE", "CH"], answerIndex: 1 }`,
  `const france = await loadDivisions("fr")  // its 96 départements, one file, fetched when asked for`,
  `projectPoint(WORLD, 139.69, 35.69)  // [x, y] of Tokyo on the world's canvas, to pin a member there`,
  `mountChizu(element, { map: WORLD, onSelect: (code) => … })  // a map to drag, zoom and press, by touch, mouse and keyboard`,
];
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const row = (testid, label, help) => `<div class="setup fam-row" data-help-en="${escape(help[0])}" data-help-ja="${escape(help[1])}"><span class="fam-label" data-say="${label}"></span><div class="fam-seg" role="group" data-say-label="${label}" id="${testid}" data-testid="${testid}"></div></div>`;

const page = `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({
      id,
      title: "Chizu · maps of the world and its countries, in English and Japanese",
      description: "Pan and zoom a map of the world, play a which-country-is-this quiz, and see numbered callouts placed in open water with leader lines that never cross. Natural Earth outlines, names in English and Japanese. Free and open source.",
      ogTitle: "Chizu maps",
      ogDescription: "The world and 31 countries' regions, a geography quiz and a callout placer, in English and Japanese.",
    })}
    <link rel="icon" href="${ICON}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="chizu.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id, links: [{ href: "api.html", say: "pageApi" }] })}
      <div class="setup fam-row" data-help-en="Choose the map: the whole world, the regions of one country (its provinces, states or départements), or one country on its own. Each country is a file of its own, fetched when you ask for it." data-help-ja="地図を選びます。世界全体、一つの国の地方（州、県、道など）、または一つの国だけ、のどれかです。国ごとに別のファイルで、選んだときに読み込みます。">
        <span class="fam-label" data-say="map"></span>
        <select class="fam-field" id="map" data-testid="map" data-say-label="map"></select>
      </div>
      ${row("modes", "mode", ["Explore the map and read the names, play the which-one-is-this quiz, or see numbered callouts placed on it.", "地図を見てなまえを調べる、「これはどこ？」クイズをする、番号つきの引き出し線を見る、から選びます。"])}
      <div class="table fam-felt" id="board" data-testid="board"></div>
      <section class="settings" id="panel-explore" data-testid="panel-explore" aria-labelledby="explore-title">
        <h2 id="explore-title" data-say="exploreTitle"></h2>
        <div class="info" id="info" data-testid="info" aria-live="polite"></div>
        <div class="setup fam-row" data-help-en="Type part of a name, in English or Japanese, to narrow the list of names below." data-help-ja="なまえの一部を、英語でも日本語でも入力すると、下の一覧がしぼりこまれます。">
          <span class="fam-label" data-say="filter"></span>
          <input class="fam-field" id="filter" data-testid="filter" type="search" autocomplete="off" data-say-placeholder="filterPlaceholder" data-say-label="filter" />
        </div>
        <div class="fam-table-box"><table id="names" data-testid="names"><thead><tr><th data-say="colCode"></th><th data-say="colEnglish"></th><th data-say="colJapanese"></th><th data-say="colReading"></th></tr></thead><tbody></tbody></table></div>
      </section>
      <section class="settings" id="panel-quiz" data-testid="panel-quiz" aria-labelledby="quiz-title" hidden>
        <h2 id="quiz-title" data-say="quizTitle"></h2>
        <p id="question" data-testid="question" aria-live="polite"></p>
        <div class="choices" id="choices" data-testid="choices" role="group" data-say-label="choices"></div>
        <div class="setup fam-row" data-help-en="Ask another question once you have answered this one. The same seed always asks the same questions; the chip counts what you got right." data-help-ja="答えたあと、つぎの問題に進みます。同じシードからは、いつも同じ問題が出ます。チップには正解の数が出ます。">
          <button type="button" class="fam-button" id="next" data-testid="next" data-say="next"></button>
          <span class="fam-chip" id="score" data-testid="score"></span>
        </div>
      </section>
      <section class="settings" id="panel-callouts" data-testid="panel-callouts" aria-labelledby="callouts-title" hidden>
        <h2 id="callouts-title" data-say="calloutsTitle"></h2>
        <p data-say="calloutsText"></p>
        ${row("polish", "polish", ["Off is the quick walk, fast enough to redraw on every move. On finishes with the slow pass a printed sheet gets: no two leaders closer than a circle's width, none through another number. It can take a few seconds.", "「なし」は速い配置で、動かすたびに描き直せます。「あり」は印刷用の仕上げで、引き出し線どうしを円の幅より近づけず、他の番号を通らないようにします。数秒かかることがあります。"])}
        ${row("numbering", "numbering", ["Number the regions in the order of the list, or as they run across the map from west to east.", "番号を、一覧の順につけるか、地図の西から東へ並ぶ順につけます。"])}
        <ol class="legend" id="legend" data-testid="legend"></ol>
      </section>
      ${familyUnreviewed({ id })}
      <section class="more" aria-labelledby="more-title">
        <h2 id="more-title" data-say="moreTitle"></h2>
        <p data-say="moreText"></p>
        <ul class="uses">
          ${uses.map((line) => `<li><code>${escape(line)}</code></li>`).join("\n          ")}
        </ul>
      </section>
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    <script type="module" src="demo.js"></script>
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
cpSync("demo", "site", { recursive: true });
// The declarations and source maps are for editors, not for a browser.
cpSync("dist", "site/dist", { recursive: true, filter: (from) => !/\.(d\.ts|map)$/.test(from) });
writeFileSync("site/index.html", page);
// The API reference, made from the source: every export of every entry point.
writeFileSync("site/api.css", API_CSS);
writeFileSync("site/api.html", apiPage({ id, name: "Chizu", icon: ICON }));
console.log("site/ is ready: serve it, or let the Pages workflow publish it.");

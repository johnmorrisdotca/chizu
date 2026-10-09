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
  `const japan = await loadDivisions("jp")  // the 47 prefectures, named and read (東京都, とうきょうと), ISO codes JP-01 to JP-47`,
  `const africa = groupMap(WORLD, CHIZU_CONTINENTS.find((c) => c.code === "AF").codes)  // a continent, for a quiz or callouts within it`,
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
      title: "Chizu · maps of Japan, the world and its countries, in English and Japanese",
      description: "Japan's 47 prefectures, the world, its continents and 32 countries' regions: pan and zoom, play and share geography quizzes, print numbered callout sheets, and colour a map from your own figures. Natural Earth outlines, names in English and Japanese. Free and open source.",
      ogTitle: "Chizu maps",
      ogDescription: "Japan's prefectures, the world and 32 countries' regions: quizzes, callout sheets and coloured maps, in English and Japanese.",
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
      <div class="setup fam-row" id="part-row" data-help-en="Look at one part of the map: a continent or a subregion of the world, or one of a country's own regions, such as Japan's Kanto. The quiz, the numbers and the colours keep to it." data-help-ja="地図の一部だけを見ます。世界なら大陸や地域、国なら日本の関東地方のような地方です。クイズ、番号、色分けもその範囲だけになります。">
        <span class="fam-label" data-say="part"></span>
        <select class="fam-field" id="part" data-testid="part" data-say-label="part"></select>
      </div>
      ${row("modes", "mode", ["Explore the map and read the names, play a quiz, see numbered callouts placed on it, or colour it from your own figures.", "地図を見てなまえを調べる、クイズをする、番号つきの目印を置く、自分の数値で色を塗る、から選びます。"])}
      <div class="table fam-felt" id="board" data-testid="board"></div>
      <section class="settings" id="panel-explore" data-testid="panel-explore" aria-labelledby="explore-title">
        <h2 id="explore-title" data-say="exploreTitle"></h2>
        <div class="info" id="info" data-testid="info" aria-live="polite"></div>
        <div class="setup fam-row" data-help-en="Type part of a name, in English or Japanese, to narrow the list of names below." data-help-ja="なまえの一部を、英語でも日本語でも入力すると、下の一覧がしぼりこまれます。">
          <span class="fam-label" data-say="filter"></span>
          <input class="fam-field" id="filter" data-testid="filter" type="search" autocomplete="off" data-say-placeholder="filterPlaceholder" data-say-label="filter" />
        </div>
        <div class="fam-table-box"><table id="names" data-testid="names"><thead><tr><th data-say="colCode"></th><th data-say="colIso"></th><th data-say="colEnglish"></th><th data-say="colJapanese"></th><th data-say="colReading"></th><th data-say="colGroup"></th></tr></thead><tbody></tbody></table></div>
        <div id="explore-map-files"></div>
        <div id="explore-list-files"></div>
      </section>
      <section class="settings" id="panel-quiz" data-testid="panel-quiz" aria-labelledby="quiz-title" hidden>
        <h2 id="quiz-title" data-say="quizTitle"></h2>
        ${row("styles", "style", ["Pick the lit place's name from four look-alikes, type its name in English or Japanese, type the reading of its name in kana, or find a named place on the map. Ten questions a round, made from a seed: share the link and a friend gets the same ten.", "光っている場所のなまえを似た4つから選ぶ、英語か日本語でなまえを入力する、なまえの読みをかなで入力する、なまえを見て地図でさがす、から選びます。1回10問で、シードから作るので、リンクを送れば友だちにも同じ10問が出ます。"])}
        <div class="fam-row quiz-chips">
          <span class="fam-chip" id="progress" data-testid="progress"></span>
          <span class="fam-chip" id="score" data-testid="score"></span>
          <span class="fam-chip" id="streak" data-testid="streak"></span>
          <span class="fam-chip" id="best" data-testid="best"></span>
        </div>
        <p id="question" data-testid="question" aria-live="polite"></p>
        <div class="choices" id="choices" data-testid="choices" role="group" data-say-label="choices"></div>
        <form class="typed fam-row" id="typed" data-testid="typed" hidden>
          <input class="fam-field" id="answer" data-testid="answer" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-say-label="answer" />
          <button type="submit" class="fam-button" data-primary="true" id="check" data-testid="check" data-say="check"></button>
          <button type="button" class="fam-button" id="skip" data-testid="skip" data-say="skip"></button>
        </form>
        <div class="fam-row">
          <button type="button" class="fam-button" id="next" data-testid="next" data-say="next"></button>
        </div>
        <div class="summary" id="quiz-summary" data-testid="quiz-summary" hidden>
          <p class="summary-text" id="summary-text" data-testid="summary-text"></p>
          <div class="fam-table-box"><table class="results" id="summary-table" data-testid="summary-table"></table></div>
          <div id="summary-files"></div>
          <p data-say="shareText"></p>
          <div class="fam-row share">
            <input class="fam-field" id="share-link" data-testid="share-link" readonly data-say-label="share" />
            <button type="button" class="fam-button" id="copy-link" data-testid="copy-link" data-copy data-say="copy"></button>
          </div>
          <div class="fam-row">
            <button type="button" class="fam-button" data-primary="true" id="new-round" data-testid="new-round" data-say="newRound"></button>
            <button type="button" class="fam-button" id="again" data-testid="again" data-say="again"></button>
          </div>
        </div>
      </section>
      <section class="settings" id="panel-callouts" data-testid="panel-callouts" aria-labelledby="callouts-title" hidden>
        <h2 id="callouts-title" data-say="calloutsTitle"></h2>
        <p data-say="calloutsText"></p>
        ${row("polish", "polish", ["Off is the quick walk, fast enough to redraw on every move. On finishes with the slow pass a printed sheet gets: no two leaders closer than a circle's width, none through another number. It can take a few seconds.", "「なし」は速い配置で、動かすたびに描き直せます。「あり」は印刷用の仕上げで、引き出し線どうしを円の幅より近づけず、他の番号を通らないようにします。数秒かかることがあります。"])}
        ${row("numbering", "numbering", ["Number the regions in the order of the list, or as they run across the map from west to east.", "番号を、一覧の順につけるか、地図の西から東へ並ぶ順につけます。"])}
        <ol class="legend" id="legend" data-testid="legend"></ol>
        <div id="callout-sheet-files"></div>
        <div id="callout-list-files"></div>
      </section>
      <section class="settings" id="panel-colour" data-testid="panel-colour" aria-labelledby="colour-title" hidden>
        <h2 id="colour-title" data-say="colourTitle"></h2>
        ${row("colour-by", "colourBy", ["Shade the places from figures you paste, in five steps from the lowest to the highest, or give each of the map's parts a colour of its own.", "貼りつけた数値で、小さいものから大きいものまで5段階に塗るか、地図の地方ごとに色を分けます。"])}
        <div class="figures" id="figures-row">
          <p data-say="colourText"></p>
          <textarea class="fam-field" id="figures" data-testid="figures" rows="6" data-mono="true" data-say-label="colourData" data-say-placeholder="colourPlaceholder" spellcheck="false"></textarea>
          <div class="fam-row">
            <button type="button" class="fam-button" id="colour-example" data-testid="colour-example" data-say="colourExample"></button>
            <span class="fam-muted" data-say="colourExampleNote"></span>
          </div>
        </div>
        <div class="colour-status" id="colour-status" aria-live="polite"></div>
        <ul class="colour-legend" id="colour-legend" data-testid="colour-legend"></ul>
        <div id="colour-map-files"></div>
        <div id="colour-data-files"></div>
      </section>
      <section class="settings code" aria-labelledby="code-title">
        <h2 id="code-title" data-say="codeTitle"></h2>
        <p data-say="codeText"></p>
        <div class="fam-seg" role="group" id="code-kind" data-testid="code-kind"></div>
        <pre class="snippet"><code id="code" data-testid="code"></code></pre>
        <div class="fam-row"><button type="button" class="fam-button" id="copy-code" data-testid="copy-code" data-copy data-say="copy"></button></div>
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

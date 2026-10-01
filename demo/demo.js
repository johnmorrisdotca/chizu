// The demo page's own script: a map to pan and zoom (the package's own `mountChizu`), the which-one-is-this quiz built
// from the engine's `findQuestion`, the callout placer, and every name in English and Japanese. The page itself only
// chooses a map and a mode and hands them on.
import { CHIZU_COUNTRIES } from "./dist/names-entry.js";
import { findQuestion, nameOf, seededRandom, shuffled, unprojectPoint } from "./dist/index.js";
import { loadCountry, loadDivisions } from "./dist/load-entry.js";
import { mountChizu } from "./dist/mount-entry.js";
import world from "./dist/world-entry.js";

// The page's own words, in the two languages it speaks. Set as text, never as HTML.
const WORDS = {
  en: {
    pageApi: "API reference",
    pitch: "A map of the world to drag and zoom, a which-country-is-this quiz, and numbered callouts placed in open water with leader lines that never cross. The outlines are Natural Earth's, and every name is in English and Japanese.",
    name: "Chizu (地図) is Japanese for “map”, the everyday word, as in 世界地図, a map of the world.",
    nameLink: "About the name",
    map: "Map",
    mode: "Mode",
    modes: { explore: "Explore", quiz: "Quiz", callouts: "Callouts" },
    groupWorld: "The world",
    groupDivisions: "Regions of a country",
    groupCountry: "A country on its own",
    world: "The whole world",
    regionsOf: (name, plural) => `${name}: ${plural.toLowerCase()}`,
    exploreTitle: "Names and places",
    filter: "Find",
    filterPlaceholder: "Part of a name",
    colCode: "Code",
    colEnglish: "English",
    colJapanese: "日本語",
    colReading: "Reading",
    nothingChosen: "Press a place on the map, or a row below.",
    infoName: (en, ja) => `${en} · ${ja}`,
    group: "Group",
    touches: "Touches",
    noNeighbours: "Touches no other place on this map.",
    centre: (lat, lon) => `Centre at ${lat} ${lon}`,
    north: "N",
    south: "S",
    east: "E",
    west: "W",
    quizTitle: "Which one is this?",
    question: (what) => `Which ${what} is lit on the map?`,
    whatCountry: "country",
    whatRegion: "region",
    choices: "The choices",
    next: "Next question",
    right: "Right! ",
    wrong: (name) => `Not quite: it is ${name}. `,
    score: (right, asked) => `${right} of ${asked}`,
    quizNeeds: "The quiz needs a map with several places on it: choose the world, or the regions of a country.",
    calloutsTitle: "Numbered callouts in open water",
    calloutsText: "Each number sits in the sea, no two leader lines cross, and a line crosses as little other land as it can. Drag or zoom the map and they are placed again for what you see.",
    polish: "Tidy",
    numbering: "Numbers",
    off: "Off",
    on: "On",
    numberingOptions: { given: "As listed", "west-to-east": "West to east" },
    legendNote: (n) => `${n} numbered`,
    moreTitle: "Using it",
    moreText: "The map above is the package itself: the world and its names, the framing, the drawing and the callout placer. Each line below is all it takes.",
    foot: "The outlines are Natural Earth's (public domain) and are fetched from this page's own folder: nothing leaves your browser.",
  },
  ja: {
    pageApi: "API（英語）",
    pitch: "ドラッグして拡大縮小できる世界地図、「これはどこ？」クイズ、海の上に置かれて引き出し線が交差しない番号つきの目印。輪郭はNatural Earthのもので、どのなまえも英語と日本語です。",
    name: "「地図」（ちず）は、地図を表すふだんのことばです。「世界地図」のように使います。",
    nameLink: "名前について（英語）",
    map: "地図",
    mode: "モード",
    modes: { explore: "調べる", quiz: "クイズ", callouts: "目印の番号" },
    groupWorld: "世界",
    groupDivisions: "国の地方",
    groupCountry: "一つの国だけ",
    world: "世界全体",
    regionsOf: (name) => `${name}の地方`,
    exploreTitle: "なまえと場所",
    filter: "さがす",
    filterPlaceholder: "なまえの一部",
    colCode: "コード",
    colEnglish: "English",
    colJapanese: "日本語",
    colReading: "読み",
    nothingChosen: "地図の場所か、下の行を押してください。",
    infoName: (en, ja) => `${ja} · ${en}`,
    group: "グループ",
    touches: "となり",
    noNeighbours: "この地図には、となりあう場所がありません。",
    centre: (lat, lon) => `中心は${lat} ${lon}`,
    north: "北緯",
    south: "南緯",
    east: "東経",
    west: "西経",
    quizTitle: "これはどこ？",
    question: (what) => `地図で光っている${what}はどれでしょう？`,
    whatCountry: "国",
    whatRegion: "地方",
    choices: "選択肢",
    next: "つぎの問題",
    right: "正解です！ ",
    wrong: (name) => `ざんねん。答えは${name}です。 `,
    score: (right, asked) => `${asked}問中${right}問`,
    quizNeeds: "クイズには、場所がいくつもある地図が必要です。世界か、国の地方を選んでください。",
    calloutsTitle: "海の上の番号つき目印",
    calloutsText: "番号は海の上に置かれ、引き出し線は交差せず、他の陸地をなるべく横切りません。地図を動かしたり拡大したりすると、見えている範囲に合わせて置きなおします。",
    polish: "仕上げ",
    numbering: "番号",
    off: "なし",
    on: "あり",
    numberingOptions: { given: "一覧の順", "west-to-east": "西から東" },
    legendNote: (n) => `${n}件に番号`,
    moreTitle: "使い方",
    moreText: "上の地図は、このパッケージそのもの（世界とそのなまえ、枠の取り方、描画、目印の配置）で動いています。下の各行がそれぞれ必要なコードのすべてです。",
    foot: "輪郭はNatural Earth（パブリックドメイン）のもので、このページと同じ場所から読み込みます。あなたのブラウザーの外には何も送られません。",
  },
};

const params = new URLSearchParams(location.search);
const MODES = ["explore", "quiz", "callouts"];
/** Twenty countries a school atlas names, for the world's callouts. */
const TWENTY = ["JP", "CN", "KR", "IN", "AU", "NZ", "US", "CA", "MX", "BR", "AR", "GB", "FR", "DE", "IT", "ES", "RU", "EG", "ZA", "KE"];

const language = familyLanguage({ id: "chizu", words: WORDS, onChange: () => refreshAll() });
const say = (key, ...args) => {
  const word = WORDS[language.lang][key];
  return typeof word === "function" ? word(...args) : word;
};
const nameIn = (region) => nameOf(region, language.lang);

const state = {
  mapKey: params.get("map") ?? "world",
  mode: MODES.includes(params.get("mode")) ? params.get("mode") : "explore",
  map: world,
  selected: null,
  polish: params.get("polish") === "on",
  numbering: params.get("numbering") === "west-to-east" ? "west-to-east" : "given",
  seed: Number(params.get("seed")) > 0 ? Number(params.get("seed")) : 1,
  question: null,
  asked: 0,
  right: 0,
  answered: false,
};

const host = document.getElementById("board");
let mount = null;

const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "text") node.textContent = value;
    else if (key === "on") for (const [event, handler] of Object.entries(value)) node.addEventListener(event, handler);
    else if (value !== undefined && value !== null) node.setAttribute(key, String(value));
  }
  node.append(...children);
  return node;
};

function seg(parent, items, chosen, choose, labelOf) {
  parent.replaceChildren(
    ...items.map((item) => {
      const button = el("button", { type: "button", "data-value": item, "aria-pressed": String(item === chosen), text: labelOf(item) });
      button.addEventListener("click", () => choose(item));
      return button;
    }),
  );
}

// ---- the map chooser ---------------------------------------------------------------------------------------
function populateMaps() {
  const select = document.getElementById("map");
  const byName = (a, b) => nameIn(a).localeCompare(nameIn(b), language.lang);
  const withDivisions = CHIZU_COUNTRIES.filter((country) => country.hasDivisions).sort(byName);
  const everyone = [...CHIZU_COUNTRIES].sort(byName);
  const option = (value, text) => el("option", { value, text, ...(value === state.mapKey ? { selected: "" } : {}) });
  select.replaceChildren(
    el("optgroup", { label: say("groupWorld") }, option("world", say("world"))),
    el("optgroup", { label: say("groupDivisions") }, ...withDivisions.map((country) => option(`divisions:${country.code.toLowerCase()}`, language.lang === "ja" ? `${nameOf(country, "ja")}（${country.name}）` : `${country.name} (${nameOf(country, "ja")})`))),
    el("optgroup", { label: say("groupCountry") }, ...everyone.map((country) => option(`country:${country.code.toLowerCase()}`, language.lang === "ja" ? `${nameOf(country, "ja")}（${country.name}）` : `${country.name} (${nameOf(country, "ja")})`))),
  );
  select.value = state.mapKey;
}

async function loadMap(key) {
  if (key === "world") return world;
  const [kind, code] = key.split(":");
  const map = kind === "divisions" ? await loadDivisions(code) : kind === "country" ? await loadCountry(code) : null;
  return map ?? world;
}

async function chooseMap(key) {
  state.mapKey = key;
  state.map = await loadMap(key);
  state.selected = null;
  state.question = null;
  host.dataset.map = state.map.id;
  mount.setMap(state.map);
  const query = new URLSearchParams(location.search);
  query.set("map", key);
  history.replaceState(history.state, "", `${location.pathname}?${query.toString()}${location.hash}`);
  refreshAll();
  if (state.mode === "quiz") nextQuestion();
}

// ---- explore: the card for the chosen place, and the table of names --------------------------------------
function coordinateText(lat, lon) {
  const ns = lat >= 0 ? say("north") : say("south");
  const ew = lon >= 0 ? say("east") : say("west");
  const a = `${ns}${Math.abs(lat).toFixed(1)}°`;
  const b = `${ew}${Math.abs(lon).toFixed(1)}°`;
  return language.lang === "ja" ? say("centre", a, b) : say("centre", `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}`, `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}`);
}

function renderInfo() {
  const info = document.getElementById("info");
  const region = state.selected ? state.map.regions.find((entry) => entry.code === state.selected) : null;
  if (!region) {
    info.replaceChildren(el("p", { class: "fam-muted", text: say("nothingChosen") }));
    return;
  }
  const japanese = region.nameShortJa ?? region.nameJa ?? region.name;
  const reading = region.reading && region.reading !== japanese ? region.reading : null;
  const [x, y] = region.centroid;
  const lonlat = state.map.kind === "world" ? unprojectPoint(state.map, x, y) : null;
  const rows = [
    el("p", { class: "info-name", "data-testid": "info-name", text: say("infoName", region.name, japanese) }),
    reading ? el("p", { class: "fam-muted", "data-testid": "info-reading", text: reading }) : null,
    el("p", { class: "fam-muted", text: `${say("group")}: ${region.group}` }),
    lonlat ? el("p", { class: "fam-muted", text: coordinateText(lonlat[1], lonlat[0]) }) : null,
    region.neighbors.length > 0
      ? el(
          "div",
          { class: "fam-row" },
          el("span", { class: "fam-label", text: say("touches") }),
          ...region.neighbors.map((code) => {
            const other = state.map.regions.find((entry) => entry.code === code);
            return el("button", { type: "button", class: "fam-chip", "data-code": code, text: other ? nameIn(other) : code, on: { click: () => choosePlace(code) } });
          }),
        )
      : el("p", { class: "fam-muted", text: say("noNeighbours") }),
  ];
  info.replaceChildren(...rows.filter(Boolean));
}

function renderNames() {
  const tbody = document.querySelector("#names tbody");
  const needle = document.getElementById("filter").value.trim().toLowerCase();
  const rows = state.map.regions.filter((region) => needle === "" || [region.name, region.nameJa, region.nameShortJa, region.reading, region.code].some((text) => (text ?? "").toLowerCase().includes(needle)));
  tbody.replaceChildren(
    ...rows.map((region) => {
      const tr = el("tr", { "data-code": region.code, "aria-selected": String(region.code === state.selected), tabindex: "0" }, el("td", { class: "fam-code", text: region.code }), el("td", { text: region.name }), el("td", { lang: "ja", text: region.nameShortJa ? `${region.nameShortJa}（${region.nameJa}）` : (region.nameJa ?? "") }), el("td", { lang: "ja", text: region.reading ?? "" }));
      const choose = () => choosePlace(region.code);
      tr.addEventListener("click", choose);
      tr.addEventListener("keydown", (event) => event.key === "Enter" && choose());
      return tr;
    }),
  );
}

function choosePlace(code) {
  if (state.mode !== "explore") return;
  state.selected = code;
  mount.select(code);
  renderInfo();
  renderNames();
}

// ---- the quiz ----------------------------------------------------------------------------------------------
function nextQuestion() {
  const map = state.map;
  const panel = document.getElementById("question");
  const choices = document.getElementById("choices");
  if (map.regions.length < 4) {
    state.question = null;
    panel.textContent = say("quizNeeds");
    choices.replaceChildren();
    mount.set({ tones: {}, selected: null, selectable: false });
    return;
  }
  // The question and its place are made from the seed: the same seed asks the same questions.
  const random = seededRandom(state.seed * 7919 + state.asked);
  const target = shuffled(map.regions, random)[0].code;
  state.question = findQuestion(map, target, random);
  state.answered = false;
  // The place is lit by a tone, never "chosen": a chosen place would be read out, and that is the answer.
  mount.set({ tones: { [target]: "selected" }, selected: null, selectable: false });
  mount.show([target]);
  renderQuestion();
}

function renderQuestion() {
  const panel = document.getElementById("question");
  const choices = document.getElementById("choices");
  const map = state.map;
  if (state.question === null) return;
  const what = map.kind === "world" ? say("whatCountry") : say("whatRegion");
  const answered = state.answered;
  if (!answered) panel.textContent = say("question", what);
  choices.replaceChildren(
    ...state.question.choices.map((code) => {
      const region = map.regions.find((entry) => entry.code === code);
      const reading = language.lang === "ja" && region.reading && region.reading !== (region.nameShortJa ?? region.nameJa) ? ` (${region.reading})` : "";
      return el("button", { type: "button", class: "fam-button", "data-code": code, "data-testid": `choice-${code}`, ...(answered ? { disabled: "" } : {}), text: nameIn(region) + reading, on: { click: () => answer(code) } });
    }),
  );
  document.getElementById("next").disabled = !answered;
  document.getElementById("score").textContent = say("score", state.right, state.asked);
}

function answer(code) {
  if (state.answered || state.question === null) return;
  state.answered = true;
  state.asked += 1;
  const target = state.question.target;
  const correct = code === target;
  if (correct) state.right += 1;
  const tones = { [target]: "correct" };
  if (!correct) tones[code] = "wrong";
  mount.set({ tones, selected: null });
  const region = state.map.regions.find((entry) => entry.code === target);
  document.getElementById("question").textContent = (correct ? say("right") : say("wrong", nameIn(region))) + nameIn(region);
  document.getElementById("question").dataset.result = correct ? "right" : "wrong";
  renderQuestion();
}

// ---- callouts ----------------------------------------------------------------------------------------------
function calloutCodes() {
  const map = state.map;
  if (map.kind === "world") return TWENTY.filter((code) => map.regions.some((region) => region.code === code));
  if (map.regions.length <= 30) return map.regions.map((region) => region.code);
  const area = (region) => (region.bbox[2] - region.bbox[0]) * (region.bbox[3] - region.bbox[1]);
  return [...map.regions].sort((a, b) => area(b) - area(a)).slice(0, 30).map((region) => region.code);
}

function applyCallouts() {
  if (state.mode !== "callouts") {
    mount.set({ callouts: undefined });
    return;
  }
  const codes = calloutCodes();
  // The world is a thousand units across and holds twenty numbers, and a country may hold thirty: smaller circles than one with sixteen.
  mount.set({ callouts: { codes, polish: state.polish, numbering: state.numbering, radiusRatio: state.map.kind === "world" ? 0.016 : Math.max(0.014, 0.03 * Math.sqrt(Math.min(1, 16 / codes.length))) } });
  const legend = document.getElementById("legend");
  const ordered = state.numbering === "west-to-east" ? [...codes].sort((a, b) => regionOf(a).centroid[0] - regionOf(b).centroid[0] || regionOf(a).centroid[1] - regionOf(b).centroid[1]) : codes;
  legend.replaceChildren(...ordered.map((code) => el("li", { "data-code": code, text: nameIn(regionOf(code)) })));
}
const regionOf = (code) => state.map.regions.find((entry) => entry.code === code);

// ---- the page --------------------------------------------------------------------------------------------
function settings() {
  seg(document.getElementById("modes"), MODES, state.mode, (value) => chooseMode(value), (value) => say("modes")[value]);
  seg(document.getElementById("polish"), [false, true], state.polish, (value) => { state.polish = value; settings(); applyCallouts(); }, (value) => say(value ? "on" : "off"));
  seg(document.getElementById("numbering"), ["given", "west-to-east"], state.numbering, (value) => { state.numbering = value; settings(); applyCallouts(); }, (value) => say("numberingOptions")[value]);
}

function chooseMode(mode) {
  state.mode = mode;
  for (const name of MODES) document.getElementById(`panel-${name}`).hidden = name !== mode;
  const query = new URLSearchParams(location.search);
  query.set("mode", mode);
  history.replaceState(history.state, "", `${location.pathname}?${query.toString()}${location.hash}`);
  if (mode === "quiz") {
    mount.set({ callouts: undefined, selectable: false });
    if (state.question === null) nextQuestion();
    else {
      mount.set({ tones: { [state.question.target]: "selected" }, selected: null });
      mount.show([state.question.target]);
    }
  } else if (mode === "callouts") {
    state.selected = null;
    mount.set({ tones: {}, selected: null, selectable: false });
    applyCallouts();
  } else {
    mount.set({ tones: {}, callouts: undefined, selectable: true, selected: state.selected });
    renderInfo();
  }
  settings();
  renderQuestion();
}

function refreshAll() {
  language.say();
  populateMaps();
  settings();
  mount?.set({ language: language.lang });
  renderInfo();
  renderNames();
  renderQuestion();
  applyCallouts();
  if (state.mode === "quiz" && state.question === null && mount) nextQuestion();
}

document.getElementById("map").addEventListener("change", (event) => chooseMap(event.target.value));
document.getElementById("filter").addEventListener("input", renderNames);
document.getElementById("next").addEventListener("click", () => nextQuestion());

state.map = await loadMap(state.mapKey);
mount = mountChizu(host, {
  map: state.map,
  language: language.lang,
  onSelect: (code) => {
    state.selected = code;
    renderInfo();
    renderNames();
  },
});
host.dataset.map = state.map.id;
refreshAll();
chooseMode(state.mode);
// An address may name the place to start on: ?select=JP.
if (state.mode === "explore" && state.map.regions.some((region) => region.code === params.get("select"))) choosePlace(params.get("select"));
host.dataset.ready = "true";

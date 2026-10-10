// The demo page's own script: a map to pan and zoom (the package's own `mountChizu`), Japan's prefectures first; any
// part of a map (a continent, a subregion, Japan's Kanto) to look at, number or quiz on; quizzes of four kinds made
// from a seed, so a link asks the same questions; numbered callout sheets to download; a map coloured from pasted
// figures; and the code that draws the map as it is. Every name in English and Japanese. The working parts that need
// no page are in tools.js; the words are in words.js.
import { CHIZU_CONTINENTS, CHIZU_COUNTRIES, CHIZU_SUBREGIONS } from "./dist/names-entry.js";
import { featureKindName, featureKindOf, findFeatures, findQuestion, groupMap, groupTones, nameOf, regionGroups, seededRandom, unprojectPoint } from "./dist/index.js";
import { drawChizu } from "./dist/draw-entry.js";
import { loadCountry, loadDivisions, loadFeatures, loadWorldDetail } from "./dist/load-entry.js";
import { mountChizu } from "./dist/mount-entry.js";
import world from "./dist/world-entry.js";
import {
  codeFor,
  fileName,
  figureSteps,
  figureText,
  foldAnswer,
  hasKanjiReading,
  isNameOf,
  isReadingOf,
  nextStreak,
  parseFigures,
  roundOrder,
  toCsv,
  toJson,
  toText,
} from "./tools.js";
import { toMarkdown, toSql } from "./downloads.js";
import { WORDS } from "./words.js";

const params = new URLSearchParams(location.search);
const MODES = ["explore", "quiz", "callouts", "colour"];
const STYLES = ["choose", "type", "kana", "find", "water"];
/** What the Features switch draws: nothing, the water, or everything named. */
const FEATURE_MODES = ["off", "water", "capitals", "all"];
const FEATURE_CHOICES = { off: [], water: ["water"], capitals: ["capitals"], all: ["all"] };
const WATER = new Set(["marine", "lakes", "rivers"]);
const ROUND = 10;
/** The deepest zoom step a quiz question is shown at. */
const QUIZ_DEEPEST = 6;
/** Twenty countries a school atlas names, for the world's callouts. */
const TWENTY = ["JP", "CN", "KR", "IN", "AU", "NZ", "US", "CA", "MX", "BR", "AR", "GB", "FR", "DE", "IT", "ES", "RU", "EG", "ZA", "KE"];
/** The colours a coloured map is shaded in, light and dark, and the colours of the parts of a map: tones the drawing does not have, given here. */
const STEP_COLOURS = { light: ["#e6f0e8", "#bcd9c5", "#88bd9f", "#4f9a73", "#2c6a4c"], dark: ["#26352b", "#2f5a41", "#3f8460", "#6db58c", "#b4e3c6"] };
const GROUP_COLOURS = { light: ["#f2c6a0", "#a9cbe8", "#c9e2a6", "#e9b7cf", "#f3e19a", "#b8b2e3", "#9fd8cf", "#e3b9a3", "#d0d0c0", "#cfe0f0"], dark: ["#7a4e2e", "#2d5375", "#4d6a2c", "#73405a", "#776a26", "#4a4380", "#2c6b62", "#6e4734", "#55554a", "#3d5266"] };

const language = familyLanguage({ id: "chizu", words: WORDS, onChange: () => refreshAll() });
const say = (key, ...args) => {
  const word = WORDS[language.lang][key];
  return typeof word === "function" ? word(...args) : word;
};
const nameIn = (region) => nameOf(region, language.lang);

const keep = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* A browser that keeps nothing: the best streak lasts the visit. */
    }
  },
};

const state = {
  mapKey: params.get("map") ?? "divisions:jp",
  partKey: params.get("part"),
  mode: MODES.includes(params.get("mode")) ? params.get("mode") : "explore",
  features: FEATURE_MODES.includes(params.get("features")) ? params.get("features") : "off",
  /** The named features of the map shown, once fetched: null before, and for a map with none. */
  layer: null,
  map: world,
  part: null,
  selected: null,
  tones: {},
  polish: params.get("polish") === "on",
  numbering: params.get("numbering") === "west-to-east" ? "west-to-east" : "given",
  colourBy: params.get("colour") === "groups" ? "groups" : "figures",
  figures: { rows: [], missing: [], noNumber: [], lines: 0 },
  quiz: {
    style: STYLES.includes(params.get("style")) ? params.get("style") : "choose",
    seed: Number(params.get("seed")) > 0 ? Math.floor(Number(params.get("seed"))) : 1,
    order: [],
    index: 0,
    question: null,
    answered: false,
    results: [],
    streak: { current: 0, best: 0 },
    note: null,
  },
  codeKind: "mount",
};

const host = document.getElementById("board");
const $ = (id) => document.getElementById(id);
let mount = null;

const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "text") node.textContent = value;
    else if (key === "on") for (const [event, handler] of Object.entries(value)) node.addEventListener(event, handler);
    else if (value !== undefined && value !== null && value !== false) node.setAttribute(key, value === true ? "" : String(value));
  }
  node.append(...children.filter((child) => child !== null && child !== undefined));
  return node;
};

function seg(parent, items, chosen, choose, labelOf) {
  parent.replaceChildren(...items.map((item) => el("button", { type: "button", "data-value": String(item), "aria-pressed": String(item === chosen), text: labelOf(item), on: { click: () => choose(item) } })));
}

function remember(changes) {
  const query = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined || value === "") query.delete(key);
    else query.set(key, String(value));
  }
  history.replaceState(history.state, "", `${location.pathname}?${query.toString()}${location.hash}`);
}

const regionOf = (code) => state.map.regions.find((entry) => entry.code === code);
/** A feature of the map shown, by its code. */
const featureOf = (code) => state.layer?.features.find((entry) => entry.code === code);
/** A region or a feature, by its code: the two never share one. */
const placeOf = (code) => regionOf(code) ?? featureOf(code);
const isWaterQuiz = () => state.mode === "quiz" && state.quiz.style === "water";
/** What the mounted map is told of the features: the switch's choice, or in a water round the water with no names on it, since a name would be the answer. */
const featureOptions = () => (isWaterQuiz() ? { features: ["water"], featureLabels: false } : { features: FEATURE_CHOICES[state.features], featureLabels: true });
/** The places in view: the part's, or the whole map's. */
/** The places in view, by name: the part's, or the whole map's, leaving out a piece the map draws but does not name. */
const inPart = () => (state.part ? state.map.regions.filter((region) => state.part.codes.includes(region.code)) : state.map.regions).filter((region) => !region.unnamed);
/** The part of this map a key names: its code, or any of its names in either language (Kansai finds Kinki). */
const findPart = (map, key) => (key ? (partsOf(map).find((part) => part.key === key) ?? partsOf(map).find((part) => [part.name, part.nameJa, ...(part.aliases ?? [])].some((name) => name && foldAnswer(name) === foldAnswer(key)))) : null) ?? null;
const dark = () => document.documentElement.dataset.theme === "dark" || (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);

// ---- the map and its part ------------------------------------------------------------------------------------
function mapLabel(country) {
  return language.lang === "ja" ? `${nameOf(country, "ja")}（${country.name}）` : `${country.name} (${nameOf(country, "ja")})`;
}

function populateMaps() {
  const select = $("map");
  const byName = (a, b) => nameIn(a).localeCompare(nameIn(b), language.lang);
  const withDivisions = CHIZU_COUNTRIES.filter((country) => country.hasDivisions && country.code !== "JP").sort(byName);
  const everyone = [...CHIZU_COUNTRIES].sort(byName);
  const continents = CHIZU_CONTINENTS.filter((continent) => continent.codes.filter((code) => world.regions.some((region) => region.code === code)).length > 1);
  const option = (value, text) => el("option", { value, text });
  select.replaceChildren(
    el("optgroup", { label: say("groupJapan") }, option("divisions:jp", say("japanPrefectures"))),
    el("optgroup", { label: say("groupWorld") }, option("world", say("world"))),
    el("optgroup", { label: say("groupContinents") }, ...continents.map((continent) => option(`continent:${continent.code}`, language.lang === "ja" ? continent.nameJa : continent.name))),
    el("optgroup", { label: say("groupDivisions") }, ...withDivisions.map((country) => option(`divisions:${country.code.toLowerCase()}`, mapLabel(country)))),
    el("optgroup", { label: say("groupCountry") }, ...everyone.map((country) => option(`country:${country.code.toLowerCase()}`, mapLabel(country)))),
  );
  select.value = state.mapKey === "world" && state.part?.kind === "continent" ? `continent:${state.part.key}` : state.mapKey;
}

/** The parts a map may be cut to: the continents and subregions on the world, a country's own groups on its regions. */
function partsOf(map) {
  const present = (codes) => codes.filter((code) => map.regions.some((region) => region.code === code));
  if (map.kind === "world") {
    const continents = CHIZU_CONTINENTS.map((one) => ({ key: one.code, kind: "continent", name: one.name, nameJa: one.nameJa, codes: present(one.codes) })).filter((one) => one.codes.length > 1);
    const subregions = CHIZU_SUBREGIONS.map((one) => ({ key: one.code, kind: "subregion", name: one.name, nameJa: one.nameJa, codes: present(one.codes) })).filter((one) => one.codes.length > 1);
    return [...continents, ...subregions];
  }
  if (map.kind === "divisions") {
    const groups = regionGroups(map);
    return groups.length > 1 ? groups.map((group) => ({ key: group.code, kind: "group", name: group.name, nameJa: group.nameJa, aliases: group.aliases, codes: group.codes })) : [];
  }
  return [];
}

function populateParts() {
  const parts = partsOf(state.map);
  const row = $("part-row");
  row.hidden = parts.length === 0;
  const select = $("part");
  const label = (part) => (language.lang === "ja" ? (part.nameJa ?? part.name) : part.name);
  // A part with another name says it too: Kinki (Kansai), 近畿地方（関西）.
  const also = (part) => {
    const other = part.aliases?.find((name) => (language.lang === "ja" ? /\p{Script=Han}/u.test(name) && !name.endsWith("地方") : !/\p{Script=Han}/u.test(name)));
    return other ? (language.lang === "ja" ? `（${other}）` : ` (${other})`) : "";
  };
  const option = (part) => el("option", { value: part.key, text: `${label(part)}${also(part)} (${part.codes.length})` });
  const byKind = (kind) => parts.filter((part) => part.kind === kind);
  select.replaceChildren(
    el("option", { value: "", text: say("whole") }),
    ...(state.map.kind === "world"
      ? [el("optgroup", { label: say("partContinents") }, ...byKind("continent").map(option)), el("optgroup", { label: say("partSubregions") }, ...byKind("subregion").map(option))]
      : [el("optgroup", { label: say("partGroups") }, ...byKind("group").map(option))]),
  );
  select.value = state.part?.key ?? "";
}

async function loadMap(key) {
  if (key === "world" || key.startsWith("continent:")) return world;
  const [kind, code] = key.split(":");
  const map = kind === "divisions" ? await loadDivisions(code) : kind === "country" ? await loadCountry(code) : null;
  return map ?? world;
}

async function chooseMap(key, partKey = null) {
  if (key.startsWith("continent:")) {
    partKey = key.slice("continent:".length);
    key = "world";
  }
  state.mapKey = key;
  state.map = await loadMap(key);
  state.layer = null;
  await ensureLayer();
  state.part = findPart(state.map, partKey);
  state.selected = null;
  host.dataset.map = state.map.id;
  mount.setMap(state.map);
  remember({ map: key, part: state.part?.key ?? null });
  refreshAll();
  showPart();
  if (state.mode === "quiz") startRound();
  else paint();
}

function choosePart(key) {
  state.part = findPart(state.map, key);
  state.selected = null;
  remember({ part: state.part?.key ?? null });
  populateMaps();
  showPart();
  renderNames();
  renderInfo();
  if (state.mode === "quiz") startRound();
  else paint();
}

/** Frame the part, or the whole map. */
function showPart() {
  if (state.part) mount.show(state.part.codes);
  else mount.reset();
}

/** The tones that fade everything outside the part. */
const partTones = () => (state.part ? groupTones(state.map, state.part.codes) : {});

function setTones(tones, extra = {}) {
  state.tones = tones;
  mount.set({ tones, ...featureOptions(), ...extra });
  renderCode();
}

/** The features of the map shown, fetched the first time they are wanted (the switch is on, a list is shown, a round of water is asked). */
async function ensureLayer() {
  if (state.layer && state.layer.map === state.map.id) return state.layer;
  const id = state.map.id;
  const layer = await loadFeatures(id);
  if (state.map.id === id) state.layer = layer;
  return state.layer;
}

/** Colour the map for the mode it is in. The quiz colours its own. */
function paint() {
  if (state.mode === "explore") setTones(partTones(), { callouts: undefined, selectable: true, selected: state.selected });
  else if (state.mode === "callouts") setTones(partTones(), { selected: null, selectable: false });
  else if (state.mode === "colour") setTones({ ...partTones(), ...colourTones() }, { callouts: undefined, selected: null, selectable: false });
}

// ---- explore: the card for the chosen place, and the table of names --------------------------------------
function coordinateText(lat, lon) {
  if (language.lang === "ja") return say("centre", `${lat >= 0 ? say("north") : say("south")}${Math.abs(lat).toFixed(1)}°`, `${lon >= 0 ? say("east") : say("west")}${Math.abs(lon).toFixed(1)}°`);
  return say("centre", `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}`, `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}`);
}

const groupIn = (region) => (language.lang === "ja" ? (region.groupJa ?? region.group) : region.group);

/**
 * The card for the chosen place, in one box whose height never changes: a name line, a line of what is known about it
 * (its reading, ISO code, part and centre), and a row of the places it touches, which scrolls sideways. With nothing
 * chosen the same three lines say what the map holds, how to choose, and the map's parts to press.
 */
function renderInfo() {
  const info = $("info");
  const region = state.selected ? placeOf(state.selected) : null;
  const line = (props, text) => el("p", { ...props, text });
  const row = (label, ...chips) => el("div", { class: "info-row" }, label ? el("span", { class: "fam-label", text: label }) : null, ...chips);
  if (!region) {
    const title = language.lang === "ja" ? (state.map.nameJa ?? state.map.name) : state.map.name;
    const parts = partsOf(state.map).filter((part) => part.kind !== "subregion");
    info.replaceChildren(
      line({ class: "info-name", "data-testid": "info-name" }, say("infoMap", title, inPart().length, state.map.kind === "world" ? say("whatCountries") : say("whatPlaces"))),
      line({ class: "fam-muted info-meta" }, say("nothingChosen")),
      row(
        parts.length ? say("part") : null,
        ...parts.map((part) => el("button", { type: "button", class: "fam-chip", "data-part": part.key, "aria-pressed": String(state.part?.key === part.key), text: language.lang === "ja" ? (part.nameJa ?? part.name) : part.name, on: { click: () => {
          $("part").value = state.part?.key === part.key ? "" : part.key;
          choosePart($("part").value);
        } } })),
      ),
    );
    return;
  }
  if (!regionOf(region.code)) {
    renderFeatureInfo(region);
    return;
  }
  const japanese = region.nameShortJa ?? region.nameJa ?? region.name;
  const reading = region.reading && region.reading !== japanese ? region.reading : null;
  const [x, y] = region.centroid;
  const lonlat = state.map.kind === "world" ? unprojectPoint(state.map, x, y) : null;
  const meta = [
    reading ? el("span", { lang: "ja", "data-testid": "info-reading", text: reading }) : null,
    region.iso ? el("span", { "data-testid": "info-iso", text: `${say("isoCode")}: ${region.iso}` }) : null,
    el("span", { "data-testid": "info-group", text: `${say("group")}: ${groupIn(region)}` }),
    lonlat ? el("span", { text: coordinateText(lonlat[1], lonlat[0]) }) : null,
  ].filter(Boolean);
  info.replaceChildren(
    line({ class: "info-name", "data-testid": "info-name" }, say("infoName", region.name, japanese)),
    el("p", { class: "fam-muted info-meta" }, ...meta.flatMap((part, index) => (index === 0 ? [part] : [" · ", part]))),
    region.neighbors.length > 0
      ? row(say("touches"), ...region.neighbors.filter((code) => regionOf(code) && !regionOf(code).unnamed).map((code) => el("button", { type: "button", class: "fam-chip", "data-code": code, text: nameIn(regionOf(code)), on: { click: () => choosePlace(code) } })))
      : row(null, el("span", { class: "fam-muted", text: say("noNeighbours") })),
  );
}

/** The card for a chosen sea, lake, river, landform or peak: its names, its kind and reading, and the water it touches. */
function renderFeatureInfo(feature) {
  const info = $("info");
  const japanese = feature.nameJa ?? feature.name;
  const reading = feature.reading && feature.reading !== japanese ? feature.reading : null;
  const meta = [
    el("span", { "data-testid": "info-kind", text: featureKindOf(feature, language.lang) }),
    reading ? el("span", { lang: "ja", "data-testid": "info-reading", text: reading }) : null,
    feature.elevation !== undefined ? el("span", { text: say("elevation", feature.elevation) }) : null,
    el("span", { class: "fam-code", text: feature.code }),
  ].filter(Boolean);
  const near = feature.neighbors.map(featureOf).filter(Boolean);
  info.replaceChildren(
    el("p", { class: "info-name", "data-testid": "info-name", text: say("infoName", feature.name, japanese) }),
    el("p", { class: "fam-muted info-meta" }, ...meta.flatMap((part, index) => (index === 0 ? [part] : [" · ", part]))),
    near.length > 0
      ? el("div", { class: "info-row" }, el("span", { class: "fam-label", text: say("touches") }), ...near.map((other) => el("button", { type: "button", class: "fam-chip", "data-code": other.code, text: nameIn(other), on: { click: () => choosePlace(other.code) } })))
      : el("div", { class: "info-row" }),
  );
}

/** The features of the map, or those a search finds, in a list whose height never changes; and their downloads. */
function renderFeatures() {
  const tbody = document.querySelector("#feature-list tbody");
  const all = state.layer?.features ?? [];
  const typed = $("feature-find").value;
  const rows = typed.trim() === "" ? all : findFeatures(all, typed, { limit: 50 });
  $("feature-count").textContent = all.length === 0 ? say("featureNone") : say("featureCount", rows.length, all.length);
  tbody.replaceChildren(
    ...rows.map((feature) =>
      el(
        "tr",
        { "data-code": feature.code, "aria-selected": String(feature.code === state.selected), tabindex: "0", on: { click: () => choosePlace(feature.code), keydown: (event) => event.key === "Enter" && choosePlace(feature.code) } },
        el("td", { text: feature.name }),
        el("td", { lang: "ja", text: feature.nameJa ?? "" }),
        el("td", { lang: "ja", text: feature.reading ?? "" }),
        el("td", { text: featureKindOf(feature, language.lang) }),
      ),
    ),
  );
  const columns = [
    { key: "code", label: "code" },
    { key: "kind", label: "kind" },
    { key: "group", label: "group" },
    { key: "name", label: "name" },
    { key: "nameJa", label: "nameJa" },
    { key: "reading", label: "reading" },
    { key: "rank", label: "rank" },
    { key: "elevation", label: "elevation" },
  ];
  const title = `${language.lang === "ja" ? (state.map.nameJa ?? state.map.name) : state.map.name} · ${say("featuresTitle")}`;
  downloadRow($("feature-files"), "download-features", say("downloadFeatures"), [
    { format: "csv", type: "text/csv", name: viewName("features"), make: () => toCsv(columns, state.layer?.features ?? []) },
    { format: "json", type: "application/json", name: viewName("features"), make: () => toJson(columns, state.layer?.features ?? [], { map: state.map.id, source: state.layer?.source ?? null }) },
    { format: "txt", type: "text/plain", name: viewName("features"), make: () => toText(title, columns, state.layer?.features ?? []) },
    { format: "md", type: "text/markdown", name: viewName("features"), make: () => toMarkdown(columns, state.layer?.features ?? []) },
    { format: "sql", type: "application/sql", name: viewName("features"), make: () => toSql("features", columns, state.layer?.features ?? []) },
  ]);
}

function renderNames() {
  const tbody = document.querySelector("#names tbody");
  const needle = foldAnswer($("filter").value);
  const rows = inPart().filter((region) => needle === "" || [region.name, region.nameJa, region.nameShortJa, region.reading, region.code, region.iso, region.group, region.groupJa, ...(region.groupAliases ?? [])].some((text) => foldAnswer(text ?? "").includes(needle)));
  tbody.replaceChildren(
    ...rows.map((region) => {
      const tr = el(
        "tr",
        { "data-code": region.code, "aria-selected": String(region.code === state.selected), tabindex: "0", on: { click: () => choosePlace(region.code), keydown: (event) => event.key === "Enter" && choosePlace(region.code) } },
        el("td", { class: "fam-code", text: region.code }),
        el("td", { class: "fam-code", text: region.iso ?? "" }),
        el("td", { text: region.name }),
        el("td", { lang: "ja", text: region.nameShortJa ? `${region.nameShortJa}（${region.nameJa}）` : (region.nameJa ?? "") }),
        el("td", { lang: "ja", text: region.reading ?? "" }),
        el("td", { text: groupIn(region) }),
      );
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
  renderFeatures();
}

// ---- downloads -----------------------------------------------------------------------------------------------
/** Hand the reader a file: text, or a Blob. */
function save(name, type, body) {
  const blob = body instanceof Blob ? body : new Blob([body], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = el("a", { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The colours the map needs beyond the drawing's own, as CSS: the steps of a coloured map and the colours of its parts. */
function extraStyle(theme) {
  const steps = STEP_COLOURS[theme].map((colour, index) => `.chizu .cz-tone-step${index + 1} .cz-land { fill: ${colour}; }`);
  const groups = GROUP_COLOURS[theme].map((colour, index) => `.chizu .cz-tone-group${index + 1} .cz-land { fill: ${colour}; }`);
  return [...steps, ...groups].join("\n");
}

/** The map as it is drawn now, as a standalone SVG in the light look: the window, the tones, any callouts, with the style inside. */
function currentSvg({ callouts = null, labels = false } = {}) {
  const box = mount.view().box;
  const svg = drawChizu(state.map, { box, tones: state.tones, language: language.lang, style: true, labels, ...(callouts ? { callouts } : {}) });
  const width = 1200;
  const height = Math.round((width * box.height) / box.width);
  return svg.replace("<svg ", `<svg width="${width}" height="${height}" data-theme="light" `).replace("</style>", `\n${extraStyle("light")}</style>`);
}

/** A standalone SVG made a PNG, twice its size, through a canvas: nothing leaves the page. */
async function svgToPng(svg) {
  const width = Number(svg.match(/ width="(\d+)"/)[1]);
  const height = Number(svg.match(/ height="(\d+)"/)[1]);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.decoding = "sync";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

const FORMAT_LABELS = { md: "Markdown", sql: "SQL" };

/** A row of buttons, one for each kind of file a thing can be downloaded as. */
function downloadRow(container, testid, label, files) {
  container.replaceChildren(
    el(
      "div",
      { class: "downloads fam-row", "data-testid": testid },
      el("span", { class: "fam-label", text: label }),
      ...files.map((file) =>
        el("button", {
          type: "button",
          class: "fam-button",
          "data-format": file.format,
          "data-testid": `${testid}-${file.format}`,
          text: FORMAT_LABELS[file.format] ?? file.format.toUpperCase(),
          on: {
            click: async () => {
              const body = await file.make();
              save(`${file.name}.${file.format}`, file.type, body);
            },
          },
        }),
      ),
    ),
  );
}

/** The table of places in view: code, ISO code, names, reading and part, for a file. */
function placeTable() {
  const columns = [
    { key: "code", label: "code" },
    { key: "iso", label: "iso" },
    { key: "name", label: "name" },
    { key: "nameJa", label: "nameJa" },
    { key: "reading", label: "reading" },
    { key: "group", label: "group" },
    { key: "groupJa", label: "groupJa" },
  ];
  return { columns, rows: inPart() };
}

const viewName = (...more) => fileName("chizu", state.map.id, state.part?.name, ...more);

function renderExploreDownloads() {
  downloadRow($("explore-map-files"), "download-map", say("downloadMap"), [
    { format: "svg", type: "image/svg+xml", name: viewName("map"), make: () => currentSvg({ labels: true }) },
    { format: "png", type: "image/png", name: viewName("map"), make: () => svgToPng(currentSvg({ labels: true })) },
  ]);
  const title = `${language.lang === "ja" ? (state.map.nameJa ?? state.map.name) : state.map.name}${state.part ? ` · ${language.lang === "ja" ? (state.part.nameJa ?? state.part.name) : state.part.name}` : ""}`;
  downloadRow($("explore-list-files"), "download-list", say("downloadList"), [
    { format: "csv", type: "text/csv", name: viewName("places"), make: () => toCsv(placeTable().columns, placeTable().rows) },
    { format: "json", type: "application/json", name: viewName("places"), make: () => toJson(placeTable().columns, placeTable().rows, { map: state.map.id, part: state.part?.key ?? null }) },
    { format: "txt", type: "text/plain", name: viewName("places"), make: () => toText(title, placeTable().columns, placeTable().rows) },
    { format: "md", type: "text/markdown", name: viewName("places"), make: () => toMarkdown(placeTable().columns, placeTable().rows) },
    { format: "sql", type: "application/sql", name: viewName("places"), make: () => toSql("places", placeTable().columns, placeTable().rows) },
  ]);
}

// ---- the quiz ----------------------------------------------------------------------------------------------
const bestKey = () => `chizu.best.${state.map.id}.${state.part?.key ?? "all"}.${state.quiz.style}`;

/** The places a round may ask about: the part's, and for readings only those whose names have kanji. */
function quizPool() {
  // Water big enough to press on the whole map: a lake a pixel across is not a question, on a phone.
  const pressable = (feature) => Math.max(feature.bbox[2] - feature.bbox[0], feature.bbox[3] - feature.bbox[1]) >= Math.max(state.map.width, state.map.height) * 0.02;
  if (state.quiz.style === "water") return (state.layer?.features ?? []).filter((feature) => WATER.has(feature.group) && pressable(feature)).map((feature) => feature.code);
  const regions = inPart();
  return (state.quiz.style === "kana" ? regions.filter(hasKanjiReading) : regions).map((region) => region.code);
}

async function startRound() {
  const quiz = state.quiz;
  if (quiz.style === "water") await ensureLayer();
  const pool = quizPool();
  quiz.order = pool.length >= 4 ? roundOrder(pool, ROUND, seededRandom(quiz.seed)) : [];
  quiz.index = 0;
  quiz.results = [];
  quiz.streak = { current: 0, best: Number(keep.get(bestKey())) || 0 };
  quiz.note = pool.length >= 4 ? null : state.quiz.style === "water" ? say("waterNeeds") : state.quiz.style === "kana" && inPart().length >= 4 ? say("kanaNeeds") : say("quizNeeds");
  remember({ seed: quiz.seed, style: quiz.style });
  $("quiz-summary").hidden = true;
  askQuestion();
}

function askQuestion() {
  const quiz = state.quiz;
  quiz.answered = false;
  quiz.question = null;
  if (quiz.note !== null || quiz.index >= quiz.order.length) {
    setTones(partTones(), { selected: null, selectable: false, callouts: undefined });
    renderQuestion();
    return;
  }
  const target = quiz.order[quiz.index];
  const random = seededRandom(quiz.seed * 7919 + quiz.index);
  const pool = quizPool();
  quiz.question = quiz.style === "choose" ? findQuestion(groupMap(state.map, pool), target, random) : { target, choices: [], answerIndex: -1 };
  if (quiz.style === "find" || quiz.style === "water") {
    // The place is not lit: finding it is the question. The map shows the part whole, and a press answers.
    setTones(partTones(), { selected: null, selectable: true, fit: false, callouts: undefined });
    showPart();
  } else {
    // The place is lit by a tone, never "chosen": a chosen place would be read out, and that is the answer.
    setTones({ ...partTones(), [target]: "selected" }, { selected: null, selectable: false, callouts: undefined });
    mount.show([target]);
    // A question keeps some of the map round the place in view: its neighbours are half the clue. Closer than 6× only
    // the place itself would show.
    while (mount.view().zoom > QUIZ_DEEPEST) mount.zoomBy(-1);
  }
  renderQuestion();
  if (quiz.style === "type" || quiz.style === "kana") {
    const input = $("answer");
    input.value = "";
    if (document.activeElement?.closest?.("#panel-quiz")) input.focus();
  }
}

const shownName = (region) => region.nameShortJa ?? region.nameJa ?? region.name;

function questionText() {
  const quiz = state.quiz;
  const what = state.map.kind === "world" ? say("whatCountry") : say("whatRegion");
  const region = placeOf(quiz.question.target);
  if (quiz.style === "water") return say("questionWater", nameIn(region), featureKindName(region.kind, language.lang));
  if (quiz.style === "type") return say("questionType", what);
  if (quiz.style === "kana") return say("questionKana", shownName(region));
  if (quiz.style === "find") return say("questionFind", nameIn(region));
  return say("question", what);
}

function renderQuestion() {
  const quiz = state.quiz;
  const panel = $("question");
  const choices = $("choices");
  const typed = $("typed");
  seg($("styles"), STYLES, quiz.style, chooseStyle, (value) => say("styles")[value]);
  $("score").textContent = say("score", quiz.results.filter((result) => result.result === "right").length, quiz.results.length);
  $("streak").textContent = say("streak", quiz.streak.current);
  $("streak").dataset.lit = String(quiz.streak.current >= 3);
  $("best").textContent = say("best", quiz.streak.best);
  $("progress").textContent = quiz.order.length ? say("round", Math.min(quiz.answered ? quiz.index : quiz.index + 1, quiz.order.length), quiz.order.length) : "";
  if (quiz.note !== null) {
    panel.textContent = quiz.note;
    delete panel.dataset.result;
    choices.replaceChildren();
    typed.hidden = true;
    $("next").hidden = true;
    return;
  }
  if (quiz.question === null) {
    choices.replaceChildren();
    typed.hidden = true;
    $("next").hidden = true;
    renderSummary();
    return;
  }
  if (!quiz.answered) {
    panel.textContent = questionText();
    delete panel.dataset.result;
  }
  const map = state.map;
  choices.replaceChildren(
    ...quiz.question.choices.map((code) => {
      const region = regionOf(code);
      const reading = language.lang === "ja" && region.reading && region.reading !== shownName(region) ? ` (${region.reading})` : "";
      return el("button", { type: "button", class: "fam-button", "data-code": code, "data-testid": `choice-${code}`, disabled: quiz.answered, text: nameIn(region) + reading, on: { click: () => answer(code, nameIn(region)) } });
    }),
  );
  typed.hidden = !(quiz.style === "type" || quiz.style === "kana");
  $("answer").setAttribute("lang", quiz.style === "kana" ? "ja" : language.lang);
  $("answer").placeholder = quiz.style === "kana" ? say("answerKanaPlaceholder") : say("answerPlaceholder");
  $("answer").disabled = quiz.answered;
  $("check").disabled = quiz.answered;
  $("skip").disabled = quiz.answered;
  $("next").hidden = false;
  $("next").disabled = !quiz.answered;
  void map;
}

function chooseStyle(style) {
  state.quiz.style = style;
  startRound();
}

function chooseFeatures(value) {
  state.features = value;
  remember({ features: value === "off" ? null : value });
  settings();
  ensureLayer().then(() => {
    mount.set(featureOptions());
    renderFeatures();
    renderCode();
  });
}

/** Judge an answer: `code` is the place chosen or pressed (or null for a typed one), `said` the words given. */
function answer(code, said, verdict = null) {
  const quiz = state.quiz;
  if (quiz.answered || quiz.question === null) return;
  quiz.answered = true;
  const target = quiz.question.target;
  const region = placeOf(target);
  const result = verdict ?? (code === target ? "right" : "wrong");
  quiz.streak = nextStreak(quiz.streak, result === "right");
  if (quiz.streak.best > (Number(keep.get(bestKey())) || 0)) keep.set(bestKey(), String(quiz.streak.best));
  quiz.results.push({ n: quiz.index + 1, code: target, iso: region.iso ?? "", place: nameIn(region), reading: region.reading ?? "", given: said, result });
  const tones = { ...partTones(), [target]: "correct" };
  if (result === "wrong" && code && code !== target) tones[code] = "wrong";
  setTones(tones, { selected: null, selectable: false });
  if (quiz.style === "find" || quiz.style === "water") mount.show(code && code !== target ? [target, code] : [target]);
  const panel = $("question");
  const right = quiz.style === "kana" ? `${shownName(region)}（${region.reading}）` : nameIn(region);
  panel.textContent = result === "right" ? say("right") + right : result === "shown" ? say("shown", right) : say("wrong", right) + (said ? say("youSaid", said) : "");
  panel.dataset.result = result;
  quiz.index += 1;
  renderQuestion();
  if (quiz.index >= quiz.order.length) renderSummary();
  $("next").focus({ preventScroll: true });
}

function checkTyped(event) {
  event?.preventDefault();
  const quiz = state.quiz;
  if (quiz.answered || quiz.question === null) return;
  const typed = $("answer").value.trim();
  if (typed === "") return;
  const region = regionOf(quiz.question.target);
  const right = quiz.style === "kana" ? isReadingOf(typed, region) : isNameOf(typed, region);
  answer(null, typed, right ? "right" : "wrong");
}

function nextQuestion() {
  if (state.quiz.index >= state.quiz.order.length) {
    renderSummary();
    return;
  }
  askQuestion();
}

const resultColumns = () => [
  { key: "n", label: say("colQuestion") },
  { key: "code", label: "code" },
  { key: "iso", label: "iso" },
  { key: "place", label: say("colPlace") },
  { key: "reading", label: say("colReading") },
  { key: "given", label: say("colGiven") },
  { key: "resultText", label: say("colResult") },
];

function shareLink() {
  const query = new URLSearchParams({ map: state.mapKey, mode: "quiz", style: state.quiz.style, seed: String(state.quiz.seed), lang: language.lang });
  if (state.part) query.set("part", state.part.key);
  return `${location.origin}${location.pathname}?${query.toString()}`;
}

function renderSummary() {
  const quiz = state.quiz;
  const summary = $("quiz-summary");
  const done = quiz.order.length > 0 && quiz.results.length >= quiz.order.length;
  summary.hidden = !done;
  if (!done) return;
  $("next").hidden = true;
  const rightCount = quiz.results.filter((result) => result.result === "right").length;
  $("summary-text").textContent = say("roundDone", rightCount, quiz.results.length, quiz.streak.best);
  const words = { right: say("resultRight"), wrong: say("resultWrong"), shown: say("resultShown") };
  const rows = quiz.results.map((result) => ({ ...result, resultText: words[result.result] }));
  $("summary-table").replaceChildren(
    el("thead", {}, el("tr", {}, ...resultColumns().map((column) => el("th", { text: column.label })))),
    el("tbody", {}, ...rows.map((row) => el("tr", { "data-result": row.result }, ...resultColumns().map((column) => el("td", { text: String(row[column.key] ?? "") }))))),
  );
  const title = `${say("roundTable")} · ${state.map.name} · seed ${quiz.seed}`;
  downloadRow($("summary-files"), "download-results", say("download"), [
    { format: "csv", type: "text/csv", name: viewName("quiz", String(quiz.seed)), make: () => toCsv(resultColumns(), rows) },
    { format: "json", type: "application/json", name: viewName("quiz", String(quiz.seed)), make: () => toJson(resultColumns(), rows, { map: state.map.id, part: state.part?.key ?? null, style: quiz.style, seed: quiz.seed, link: shareLink() }) },
    { format: "txt", type: "text/plain", name: viewName("quiz", String(quiz.seed)), make: () => toText(`${title}\n${$("summary-text").textContent}\n${shareLink()}`, resultColumns(), rows) },
    { format: "md", type: "text/markdown", name: viewName("quiz", String(quiz.seed)), make: () => toMarkdown(resultColumns(), rows) },
    { format: "sql", type: "application/sql", name: viewName("quiz", String(quiz.seed)), make: () => toSql("quiz_results", resultColumns(), rows) },
  ]);
  $("share-link").value = shareLink();
}

// ---- callouts ----------------------------------------------------------------------------------------------
function calloutCodes() {
  const regions = inPart();
  if (state.map.kind === "world" && !state.part) return TWENTY.filter((code) => regionOf(code));
  if (regions.length <= 30) return regions.map((region) => region.code);
  const area = (region) => (region.bbox[2] - region.bbox[0]) * (region.bbox[3] - region.bbox[1]);
  return [...regions].sort((a, b) => area(b) - area(a)).slice(0, 30).map((region) => region.code);
}

function calloutRequest() {
  const codes = calloutCodes();
  // The world is a thousand units across and holds twenty numbers, and a country may hold thirty: smaller circles than one with sixteen.
  const radiusRatio = state.map.kind === "world" && !state.part ? 0.016 : Math.max(0.014, 0.03 * Math.sqrt(Math.min(1, 16 / codes.length)));
  return { codes, polish: state.polish, numbering: state.numbering, radiusRatio: Math.round(radiusRatio * 10000) / 10000 };
}

function orderedCallouts() {
  const codes = calloutCodes();
  return state.numbering === "west-to-east" ? [...codes].sort((a, b) => regionOf(a).centroid[0] - regionOf(b).centroid[0] || regionOf(a).centroid[1] - regionOf(b).centroid[1]) : codes;
}

function applyCallouts() {
  if (state.mode !== "callouts") {
    mount.set({ callouts: undefined });
    renderCode();
    return;
  }
  mount.set({ callouts: calloutRequest() });
  $("legend").replaceChildren(...orderedCallouts().map((code) => el("li", { "data-code": code, text: nameIn(regionOf(code)) })));
  renderCode();
  const legendRows = () => orderedCallouts().map((code, index) => ({ number: index + 1, code, iso: regionOf(code).iso ?? "", name: regionOf(code).name, nameJa: regionOf(code).nameJa ?? "", reading: regionOf(code).reading ?? "" }));
  const columns = [
    { key: "number", label: "number" },
    { key: "code", label: "code" },
    { key: "iso", label: "iso" },
    { key: "name", label: "name" },
    { key: "nameJa", label: "nameJa" },
    { key: "reading", label: "reading" },
  ];
  downloadRow($("callout-sheet-files"), "download-sheet", say("downloadSheet"), [
    { format: "svg", type: "image/svg+xml", name: viewName("callouts"), make: () => calloutSheet() },
    { format: "png", type: "image/png", name: viewName("callouts"), make: () => svgToPng(calloutSheet()) },
  ]);
  downloadRow($("callout-list-files"), "download-legend", say("downloadLegend"), [
    { format: "csv", type: "text/csv", name: viewName("callouts"), make: () => toCsv(columns, legendRows()) },
    { format: "json", type: "application/json", name: viewName("callouts"), make: () => toJson(columns, legendRows(), { map: state.map.id }) },
    { format: "txt", type: "text/plain", name: viewName("callouts"), make: () => toText(state.map.name, columns, legendRows()) },
    { format: "md", type: "text/markdown", name: viewName("callouts"), make: () => toMarkdown(columns, legendRows()) },
    { format: "sql", type: "application/sql", name: viewName("callouts"), make: () => toSql("callouts", columns, legendRows()) },
  ]);
}

/** A sheet to print: the map with its numbered callouts, and under it the numbered list, as one SVG. */
function calloutSheet() {
  const map = currentSvg({ callouts: calloutRequest() });
  const width = Number(map.match(/ width="(\d+)"/)[1]);
  const height = Number(map.match(/ height="(\d+)"/)[1]);
  const names = orderedCallouts().map((code) => nameIn(regionOf(code)));
  const columns = 3;
  const line = 30;
  const rows = Math.ceil(names.length / columns);
  const legendHeight = rows * line + 40;
  const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const items = names.map((name, index) => `<text x="${24 + (index % columns) * (width / columns)}" y="${height + 34 + Math.floor(index / columns) * line}" font-size="18" font-family="system-ui, -apple-system, 'Hiragino Sans', 'Noto Sans JP', sans-serif" fill="#1f2320"><tspan font-weight="700">${index + 1}</tspan>  ${escape(name)}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + legendHeight}" viewBox="0 0 ${width} ${height + legendHeight}"><rect width="100%" height="100%" fill="#ffffff"/>${map.replace("<svg ", '<svg x="0" y="0" ')}${items.join("")}</svg>`;
}

// ---- colour ------------------------------------------------------------------------------------------------
/** A place's words to its code: its code, its ISO code, or any of its names, in the part in view. */
function findPlace(words) {
  const folded = foldAnswer(words);
  if (folded === "") return null;
  const region = inPart().find((one) => [one.code, one.iso].some((code) => code && foldAnswer(code) === folded)) ?? inPart().find((one) => isNameOf(words, one));
  return region?.code ?? null;
}

function readFigures() {
  const text = $("figures").value;
  state.figures = { ...parseFigures(text, findPlace), lines: text.split(/\r?\n/).filter((line) => line.trim() !== "").length };
  remember({ colour: state.colourBy === "groups" ? "groups" : null });
  renderColour();
  paint();
}

function colourTones() {
  if (state.colourBy === "groups") {
    const groups = regionGroups({ regions: inPart() });
    const tones = {};
    groups.forEach((group, index) => group.codes.forEach((code) => (tones[code] = `group${(index % GROUP_COLOURS.light.length) + 1}`)));
    return tones;
  }
  const { stepOf } = figureSteps(state.figures.rows);
  const tones = {};
  for (const [code, step] of stepOf) tones[code] = `step${step}`;
  return tones;
}

function renderColour() {
  seg($("colour-by"), ["figures", "groups"], state.colourBy, (value) => {
    state.colourBy = value;
    remember({ colour: value === "groups" ? "groups" : null });
    renderColour();
    paint();
  }, (value) => say("colourModes")[value]);
  $("figures-row").hidden = state.colourBy !== "figures";
  const status = $("colour-status");
  const legend = $("colour-legend");
  const theme = dark() ? "dark" : "light";
  if (state.colourBy === "groups") {
    const groups = regionGroups({ regions: inPart() });
    status.replaceChildren();
    legend.replaceChildren(...groups.map((group, index) => el("li", { "data-group": group.code }, el("span", { class: "swatch", style: `background:${GROUP_COLOURS[theme][index % GROUP_COLOURS[theme].length]}` }), el("span", { text: `${language.lang === "ja" ? (group.nameJa ?? group.name) : group.name} (${group.codes.length})` }))));
  } else {
    const { rows, missing, noNumber, lines } = state.figures;
    const { steps } = figureSteps(rows);
    status.replaceChildren(
      ...[
        el("p", { "data-testid": "colour-count", text: lines === 0 ? say("colourEmpty") : say("colourCount", rows.length, lines) }),
        missing.length ? el("p", { class: "fam-error", "data-testid": "colour-missing", text: say("colourMissing", missing.join(", ")) }) : null,
        noNumber.length ? el("p", { class: "fam-error", "data-testid": "colour-bad-number", text: say("colourBadNumber", noNumber.join(", ")) }) : null,
      ].filter(Boolean),
    );
    legend.replaceChildren(...steps.map((step) => el("li", { "data-step": String(step.step) }, el("span", { class: "swatch", style: `background:${STEP_COLOURS[theme][step.step - 1]}` }), el("span", { text: `${say("colourStep", figureText(step.from, language.lang), figureText(step.to, language.lang))} (${step.count})` }))));
  }
  const { stepOf } = figureSteps(state.figures.rows);
  const figureRows = () => state.figures.rows.map((row) => ({ code: row.code, iso: regionOf(row.code)?.iso ?? "", name: regionOf(row.code)?.name ?? "", nameJa: regionOf(row.code)?.nameJa ?? "", value: row.value, step: stepOf.get(row.code) }));
  const columns = [
    { key: "code", label: "code" },
    { key: "iso", label: "iso" },
    { key: "name", label: "name" },
    { key: "nameJa", label: "nameJa" },
    { key: "value", label: "value" },
    { key: "step", label: "step" },
  ];
  downloadRow($("colour-map-files"), "download-coloured", say("downloadColoured"), [
    { format: "svg", type: "image/svg+xml", name: viewName("coloured"), make: () => currentSvg() },
    { format: "png", type: "image/png", name: viewName("coloured"), make: () => svgToPng(currentSvg()) },
  ]);
  downloadRow($("colour-data-files"), "download-figures", say("downloadFigures"), [
    { format: "csv", type: "text/csv", name: viewName("figures"), make: () => toCsv(columns, figureRows()) },
    { format: "json", type: "application/json", name: viewName("figures"), make: () => toJson(columns, figureRows(), { map: state.map.id }) },
    { format: "txt", type: "text/plain", name: viewName("figures"), make: () => toText(state.map.name, columns, figureRows()) },
    { format: "md", type: "text/markdown", name: viewName("figures"), make: () => toMarkdown(columns, figureRows()) },
    { format: "sql", type: "application/sql", name: viewName("figures"), make: () => toSql("figures", columns, figureRows()) },
  ]);
}

/** The example: how many places each place touches on this map, which the map itself knows. */
function colourExample() {
  $("figures").value = inPart()
    .map((region) => `${region.iso ?? region.code}, ${region.neighbors.filter((code) => inPart().some((other) => other.code === code)).length}`)
    .join("\n");
  readFigures();
}

// ---- the code for this view ------------------------------------------------------------------------------
function renderCode() {
  if (!mount) return;
  const shownTones = Object.fromEntries(Object.entries(state.tones).filter(([code, tone]) => !(state.part && tone === "faint" && !state.part.codes.includes(code))));
  const features = featureOptions().features;
  const view = { mapKey: state.mapKey, mapId: state.map.id, language: language.lang, tones: shownTones, callouts: state.mode === "callouts" ? calloutRequest() : null, part: state.part ? { codes: state.part.codes } : null, features: features.length ? features : null };
  seg($("code-kind"), ["mount", "draw"], state.codeKind, (value) => {
    state.codeKind = value;
    renderCode();
  }, (value) => say(value === "mount" ? "codeMount" : "codeDraw"));
  $("code").textContent = codeFor(view, state.codeKind);
}

async function copyText(text, button) {
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    // A page without the clipboard's permission copies the old way, from a field it selects.
    const field = el("textarea", { readonly: true, style: "position:fixed;opacity:0;left:0;top:0" });
    field.value = text;
    document.body.append(field);
    field.select();
    copied = document.execCommand?.("copy") ?? false;
    field.remove();
  }
  button.textContent = copied ? say("copied") : say("copy");
  setTimeout(() => (button.textContent = say("copy")), 1600);
}

// ---- the page --------------------------------------------------------------------------------------------
function settings() {
  seg($("modes"), MODES, state.mode, (value) => chooseMode(value), (value) => say("modes")[value]);
  seg($("features"), FEATURE_MODES, state.features, chooseFeatures, (value) => say("featureModes")[value]);
  seg($("polish"), [false, true], state.polish, (value) => {
    state.polish = value;
    remember({ polish: value ? "on" : null });
    settings();
    applyCallouts();
  }, (value) => say(value ? "on" : "off"));
  seg($("numbering"), ["given", "west-to-east"], state.numbering, (value) => {
    state.numbering = value;
    remember({ numbering: value === "west-to-east" ? value : null });
    settings();
    applyCallouts();
  }, (value) => say("numberingOptions")[value]);
}

function chooseMode(mode) {
  state.mode = mode;
  for (const name of MODES) $(`panel-${name}`).hidden = name !== mode;
  remember({ mode: mode === "explore" ? null : mode });
  mount.set({ fit: true });
  if (mode === "quiz") {
    mount.set({ callouts: undefined });
    startRound();
  } else if (mode === "callouts") {
    state.selected = null;
    paint();
    applyCallouts();
  } else if (mode === "colour") {
    state.selected = null;
    renderColour();
    paint();
  } else {
    paint();
    renderInfo();
  }
  settings();
  renderCode();
}

function refreshAll() {
  language.say();
  populateMaps();
  populateParts();
  settings();
  mount?.set({ language: language.lang });
  renderInfo();
  renderNames();
  renderFeatures();
  renderExploreDownloads();
  if (mount && state.mode === "quiz") renderQuestion();
  if (mount && state.mode === "callouts") applyCallouts();
  if (mount && state.mode === "colour") renderColour();
  if (mount) {
    for (const button of document.querySelectorAll("[data-copy]")) button.textContent = say("copy");
  }
  renderCode();
}

$("map").addEventListener("change", (event) => chooseMap(event.target.value));
$("part").addEventListener("change", (event) => choosePart(event.target.value));
$("filter").addEventListener("input", renderNames);
$("feature-find").addEventListener("input", renderFeatures);
$("next").addEventListener("click", () => nextQuestion());
$("typed").addEventListener("submit", checkTyped);
$("skip").addEventListener("click", () => answer(null, "", "shown"));
$("new-round").addEventListener("click", () => {
  state.quiz.seed = 1 + Math.floor(Math.random() * 999999);
  startRound();
});
$("again").addEventListener("click", () => startRound());
$("copy-link").addEventListener("click", (event) => copyText($("share-link").value, event.currentTarget));
$("copy-code").addEventListener("click", (event) => copyText($("code").textContent, event.currentTarget));
$("figures").addEventListener("input", readFigures);
$("colour-example").addEventListener("click", colourExample);
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => state.mode === "colour" && renderColour());

// The colours of a coloured map and of the parts, light and dark, for the map on the page.
document.head.append(el("style", { text: `${extraStyle("light")}\n@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) ${extraStyle("dark").replace(/\n/g, `\n:root:not([data-theme="light"]) `)} }\n:root[data-theme="dark"] ${extraStyle("dark").replace(/\n/g, `\n:root[data-theme="dark"] `)}` }));

if (state.mapKey.startsWith("continent:")) {
  state.partKey = state.mapKey.slice("continent:".length);
  state.mapKey = "world";
}
state.map = await loadMap(state.mapKey);
await ensureLayer();
state.part = findPart(state.map, state.partKey);
mount = mountChizu(host, {
  map: state.map,
  language: language.lang,
  // From 4× in, the world is drawn from the finer 1:50m outlines, fetched the first time they are wanted.
  detail: loadWorldDetail,
  // Each map's seas, lakes and rivers, fetched the first time they are drawn.
  featureLayer: loadFeatures,
  ...featureOptions(),
  onSelect: (code) => {
    if (state.mode === "quiz") {
      // Finding a place, a press on the sea is not an answer; finding the water, a press on the land is a wrong one.
      if (state.quiz.style === "find" && code !== null && regionOf(code) && !state.quiz.answered) answer(code, nameIn(regionOf(code)));
      if (state.quiz.style === "water" && code !== null && placeOf(code) && !state.quiz.answered) answer(code, nameIn(placeOf(code)));
      return;
    }
    state.selected = code;
    renderInfo();
    renderNames();
    renderFeatures();
  },
});
host.dataset.map = state.map.id;
refreshAll();
showPart();
chooseMode(state.mode);
// An address may name the place to start on: ?select=13.
if (state.mode === "explore" && regionOf(params.get("select"))) choosePlace(params.get("select"));
host.dataset.ready = "true";

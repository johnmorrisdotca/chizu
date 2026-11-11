// The demo page's shared state, words and small DOM helpers, used by every panel. Split from demo.js; the panels share one state object (demo-core.js).

import { nameOf, regionGroups } from "./dist/index.js";
import { CHIZU_CONTINENTS, CHIZU_SUBREGIONS } from "./dist/names-entry.js";
import world from "./dist/world-entry.js";
import { foldAnswer } from "./tools.js";
import { WORDS } from "./words.js";

export const params = new URLSearchParams(location.search);
export const MODES = ["explore", "quiz", "callouts", "colour"];
export const STYLES = ["choose", "type", "kana", "find", "water"];
/** What the Features switch draws: nothing, the water, or everything named. */
export const FEATURE_MODES = ["off", "water", "capitals", "all"];
export const FEATURE_CHOICES = { off: [], water: ["water"], capitals: ["capitals"], all: ["all"] };
export const WATER = new Set(["marine", "lakes", "rivers"]);
export const ROUND = 10;
/** The deepest zoom step a quiz question is shown at. */
export const QUIZ_DEEPEST = 6;
/** Twenty countries a school atlas names, for the world's callouts. */
export const TWENTY = [
  "JP",
  "CN",
  "KR",
  "IN",
  "AU",
  "NZ",
  "US",
  "CA",
  "MX",
  "BR",
  "AR",
  "GB",
  "FR",
  "DE",
  "IT",
  "ES",
  "RU",
  "EG",
  "ZA",
  "KE",
];
/** The colours a coloured map is shaded in, light and dark, and the colours of the parts of a map: tones the drawing does not have, given here. */
export const STEP_COLOURS = {
  light: ["#e6f0e8", "#bcd9c5", "#88bd9f", "#4f9a73", "#2c6a4c"],
  dark: ["#26352b", "#2f5a41", "#3f8460", "#6db58c", "#b4e3c6"],
};
export const GROUP_COLOURS = {
  light: ["#f2c6a0", "#a9cbe8", "#c9e2a6", "#e9b7cf", "#f3e19a", "#b8b2e3", "#9fd8cf", "#e3b9a3", "#d0d0c0", "#cfe0f0"],
  dark: ["#7a4e2e", "#2d5375", "#4d6a2c", "#73405a", "#776a26", "#4a4380", "#2c6b62", "#6e4734", "#55554a", "#3d5266"],
};

/**
 * The entry points one panel calls in another (the code panel, a fresh round, the names list), filled in by demo.js
 * before the page starts. A panel imports this module and the helpers below it, never a panel above it, so no import
 * runs in a cycle.
 */
export const calls = {
  colourTones: () => ({}),
  docsLink: () => {},
  refreshAll: () => {},
  renderCode: () => {},
  renderInfo: () => {},
  renderNames: () => {},
  settings: () => {},
  startRound: async () => {},
};

export const language = familyLanguage({
  id: "chizu",
  words: WORDS,
  onChange: () => {
    calls.docsLink();
    calls.refreshAll();
  },
});
export const say = (key, ...args) => {
  const word = WORDS[language.lang][key];
  return typeof word === "function" ? word(...args) : word;
};
export const nameIn = (region) => nameOf(region, language.lang);

export const state = {
  mapKey: params.get("map") ?? "divisions:jp",
  partKey: params.get("part"),
  mode: MODES.includes(params.get("mode")) ? params.get("mode") : "explore",
  features: FEATURE_MODES.includes(params.get("features")) ? params.get("features") : "off",
  cities: params.get("cities") === "on",
  overlays: params.get("overlays") === "on",
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

export const host = document.getElementById("board");
export const $ = (id) => document.getElementById(id);
// The mounted map and the city scale's refresh, set once at startup and read by every panel.
export const live = { mount: null, refreshCity: null };
/** Draws the city-scale section again; set once the section is wired. */

export const el = (tag, props = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "text") node.textContent = value;
    else if (key === "on") for (const [event, handler] of Object.entries(value)) node.addEventListener(event, handler);
    else if (value !== undefined && value !== null && value !== false)
      node.setAttribute(key, value === true ? "" : String(value));
  }
  node.append(...children.filter((child) => child !== null && child !== undefined));
  return node;
};

export function seg(parent, items, chosen, choose, labelOf) {
  parent.replaceChildren(
    ...items.map((item) =>
      el("button", {
        type: "button",
        "data-value": String(item),
        "aria-pressed": String(item === chosen),
        text: labelOf(item),
        on: { click: () => choose(item) },
      }),
    ),
  );
}

export function remember(changes) {
  const query = new URLSearchParams(location.search);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === undefined || value === "") query.delete(key);
    else query.set(key, String(value));
  }
  history.replaceState(history.state, "", `${location.pathname}?${query.toString()}${location.hash}`);
}

export const regionOf = (code) => state.map.regions.find((entry) => entry.code === code);
/** A feature of the map shown, by its code. */
export const featureOf = (code) => state.layer?.features.find((entry) => entry.code === code);
/** A region or a feature, by its code: the two never share one. */
export const placeOf = (code) => regionOf(code) ?? featureOf(code);
export const isWaterQuiz = () => state.mode === "quiz" && state.quiz.style === "water";
/** What the mounted map is told of the features: the switch's choice, or in a water round the water with no names on it, since a name would be the answer. */
export const featureOptions = () =>
  isWaterQuiz()
    ? { features: ["water"], featureLabels: false }
    : { features: FEATURE_CHOICES[state.features], featureLabels: true };
/** The places in view: the part's, or the whole map's. */
/** The places in view, by name: the part's, or the whole map's, leaving out a piece the map draws but does not name. */
export const inPart = () =>
  (state.part
    ? state.map.regions.filter((region) => state.part.codes.includes(region.code))
    : state.map.regions
  ).filter((region) => !region.unnamed);
/** The parts a map may be cut to: the continents and subregions on the world, a country's own groups on its regions. */
export function partsOf(map) {
  const present = (codes) => codes.filter((code) => map.regions.some((region) => region.code === code));
  if (map.kind === "world") {
    const continents = CHIZU_CONTINENTS.map((one) => ({
      key: one.code,
      kind: "continent",
      name: one.name,
      nameJa: one.nameJa,
      codes: present(one.codes),
    })).filter((one) => one.codes.length > 1);
    const subregions = CHIZU_SUBREGIONS.map((one) => ({
      key: one.code,
      kind: "subregion",
      name: one.name,
      nameJa: one.nameJa,
      codes: present(one.codes),
    })).filter((one) => one.codes.length > 1);
    return [...continents, ...subregions];
  }
  if (map.kind === "divisions") {
    const groups = regionGroups(map);
    return groups.length > 1
      ? groups.map((group) => ({
          key: group.code,
          kind: "group",
          name: group.name,
          nameJa: group.nameJa,
          aliases: group.aliases,
          codes: group.codes,
        }))
      : [];
  }
  return [];
}

/** The part of this map a key names: its code, or any of its names in either language (Kansai finds Kinki). */
export const findPart = (map, key) =>
  (key
    ? (partsOf(map).find((part) => part.key === key) ??
      partsOf(map).find((part) =>
        [part.name, part.nameJa, ...(part.aliases ?? [])].some((name) => name && foldAnswer(name) === foldAnswer(key)),
      ))
    : null) ?? null;
export const dark = () =>
  document.documentElement.dataset.theme === "dark" ||
  (document.documentElement.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);

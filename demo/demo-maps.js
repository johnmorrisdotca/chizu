// The demo page's map and part choosers, loading a map and painting it. Split from demo.js; the panels share one state object (demo-core.js).

import {
  $,
  calls,
  el,
  featureOptions,
  findPart,
  host,
  language,
  live,
  nameIn,
  partsOf,
  remember,
  say,
  state,
} from "./demo-core.js";
import { groupTones, nameOf } from "./dist/index.js";
import { loadCountry, loadDivisions, loadFeatures } from "./dist/load-entry.js";
import { CHIZU_CONTINENTS, CHIZU_COUNTRIES } from "./dist/names-entry.js";
import world from "./dist/world-entry.js";

// ---- the map and its part ------------------------------------------------------------------------------------
export function mapLabel(country) {
  return language.lang === "ja"
    ? `${nameOf(country, "ja")}（${country.name}）`
    : `${country.name} (${nameOf(country, "ja")})`;
}

export function populateMaps() {
  const select = $("map");
  const byName = (a, b) => nameIn(a).localeCompare(nameIn(b), language.lang);
  const withDivisions = CHIZU_COUNTRIES.filter((country) => country.hasDivisions && country.code !== "JP").sort(byName);
  const everyone = [...CHIZU_COUNTRIES].sort(byName);
  const continents = CHIZU_CONTINENTS.filter(
    (continent) => continent.codes.filter((code) => world.regions.some((region) => region.code === code)).length > 1,
  );
  const option = (value, text) => el("option", { value, text });
  select.replaceChildren(
    el("optgroup", { label: say("groupJapan") }, option("divisions:jp", say("japanPrefectures"))),
    el("optgroup", { label: say("groupWorld") }, option("world", say("world"))),
    el(
      "optgroup",
      { label: say("groupContinents") },
      ...continents.map((continent) =>
        option(`continent:${continent.code}`, language.lang === "ja" ? continent.nameJa : continent.name),
      ),
    ),
    el(
      "optgroup",
      { label: say("groupDivisions") },
      ...withDivisions.map((country) => option(`divisions:${country.code.toLowerCase()}`, mapLabel(country))),
    ),
    el(
      "optgroup",
      { label: say("groupCountry") },
      ...everyone.map((country) => option(`country:${country.code.toLowerCase()}`, mapLabel(country))),
    ),
  );
  select.value =
    state.mapKey === "world" && state.part?.kind === "continent" ? `continent:${state.part.key}` : state.mapKey;
}

export function populateParts() {
  const parts = partsOf(state.map);
  const row = $("part-row");
  row.hidden = parts.length === 0;
  const select = $("part");
  const label = (part) => (language.lang === "ja" ? (part.nameJa ?? part.name) : part.name);
  // A part with another name says it too: Kinki (Kansai), 近畿地方（関西）.
  const also = (part) => {
    const other = part.aliases?.find((name) =>
      language.lang === "ja" ? /\p{Script=Han}/u.test(name) && !name.endsWith("地方") : !/\p{Script=Han}/u.test(name),
    );
    return other ? (language.lang === "ja" ? `（${other}）` : ` (${other})`) : "";
  };
  const option = (part) =>
    el("option", { value: part.key, text: `${label(part)}${also(part)} (${part.codes.length})` });
  const byKind = (kind) => parts.filter((part) => part.kind === kind);
  select.replaceChildren(
    el("option", { value: "", text: say("whole") }),
    ...(state.map.kind === "world"
      ? [
          el("optgroup", { label: say("partContinents") }, ...byKind("continent").map(option)),
          el("optgroup", { label: say("partSubregions") }, ...byKind("subregion").map(option)),
        ]
      : [el("optgroup", { label: say("partGroups") }, ...byKind("group").map(option))]),
  );
  select.value = state.part?.key ?? "";
}

export async function loadMap(key) {
  if (key === "world" || key.startsWith("continent:")) return world;
  const [kind, code] = key.split(":");
  const map = kind === "divisions" ? await loadDivisions(code) : kind === "country" ? await loadCountry(code) : null;
  return map ?? world;
}

export async function chooseMap(key, partKey = null) {
  let currentKey = key;
  let currentPart = partKey;
  if (currentKey.startsWith("continent:")) {
    currentPart = currentKey.slice("continent:".length);
    currentKey = "world";
  }
  state.mapKey = currentKey;
  state.map = await loadMap(currentKey);
  state.layer = null;
  await ensureLayer();
  state.part = findPart(state.map, currentPart);
  state.selected = null;
  host.dataset.map = state.map.id;
  live.mount.setMap(state.map);
  remember({ map: currentKey, part: state.part?.key ?? null });
  calls.refreshAll();
  showPart();
  if (state.mode === "quiz") void calls.startRound();
  else paint();
}

export function choosePart(key) {
  state.part = findPart(state.map, key);
  state.selected = null;
  remember({ part: state.part?.key ?? null });
  populateMaps();
  showPart();
  calls.renderNames();
  calls.renderInfo();
  if (state.mode === "quiz") void calls.startRound();
  else paint();
}

/** Frame the part, or the whole map. */
export function showPart() {
  if (state.part) live.mount.show(state.part.codes);
  else live.mount.reset();
}

/** The tones that fade everything outside the part. */
export const partTones = () => (state.part ? groupTones(state.map, state.part.codes) : {});

export function setTones(tones, extra = {}) {
  state.tones = tones;
  live.mount.set({ tones, ...featureOptions(), ...extra });
  calls.renderCode();
}

/** The features of the map shown, fetched the first time they are wanted (the switch is on, a list is shown, a round of water is asked). */
export async function ensureLayer() {
  if (state.layer && state.layer.map === state.map.id) return state.layer;
  const id = state.map.id;
  const layer = await loadFeatures(id);
  if (state.map.id === id) state.layer = layer;
  return state.layer;
}

/** Colour the map for the mode it is in. The quiz colours its own. */
export function paint() {
  if (state.mode === "explore")
    setTones(partTones(), { callouts: undefined, selectable: true, selected: state.selected });
  else if (state.mode === "callouts") setTones(partTones(), { selected: null, selectable: false });
  else if (state.mode === "colour")
    setTones({ ...partTones(), ...calls.colourTones() }, { callouts: undefined, selected: null, selectable: false });
}

// ---- explore: the card for the chosen place, and the table of names --------------------------------------
export function coordinateText(lat, lon) {
  if (language.lang === "ja")
    return say(
      "centre",
      `${lat >= 0 ? say("north") : say("south")}${Math.abs(lat).toFixed(1)}°`,
      `${lon >= 0 ? say("east") : say("west")}${Math.abs(lon).toFixed(1)}°`,
    );
  return say(
    "centre",
    `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}`,
    `${Math.abs(lon).toFixed(1)}°${lon >= 0 ? "E" : "W"}`,
  );
}

export const groupIn = (region) => (language.lang === "ja" ? (region.groupJa ?? region.group) : region.group);

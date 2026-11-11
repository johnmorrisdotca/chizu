// The demo page's own script: a map to pan and zoom (the package's own `mountChizu`), Japan's prefectures first; any
// part of a map (a continent, a subregion, Japan's Kanto) to look at, number or quiz on; quizzes of four kinds made
// from a seed, so a link asks the same questions; numbered callout sheets to download; a map coloured from pasted
// figures; and the code that draws the map as it is. Every name in English and Japanese. The working parts that need
// no page are in tools.js; the words are in words.js. Each panel is a module of its own (demo-core.js holds the shared
// state, demo-maps.js, demo-info.js, demo-save.js, demo-quiz.js, demo-callouts.js and demo-colour.js); this file sets
// the page up, keeps the address and writes the code panel. Imports run one way, down to demo-core.js: what one panel
// calls in another goes through demo-core's `calls`, which this file fills in.

import { initCity } from "./city.js";
import { cityOptions } from "./city-names.js";
import { applyCallouts, calloutRequest } from "./demo-callouts.js";
import { colourExample, colourTones, readFigures, renderColour } from "./demo-colour.js";
import {
  $,
  calls,
  el,
  FEATURE_MODES,
  featureOptions,
  findPart,
  host,
  language,
  live,
  MODES,
  nameIn,
  params,
  placeOf,
  regionOf,
  remember,
  say,
  seg,
  state,
} from "./demo-core.js";
import { choosePlace, renderFeatures, renderInfo, renderNames } from "./demo-info.js";
import {
  chooseMap,
  choosePart,
  ensureLayer,
  loadMap,
  paint,
  populateMaps,
  populateParts,
  showPart,
} from "./demo-maps.js";
import {
  answer,
  checkTyped,
  chooseCities,
  chooseFeatures,
  nextQuestion,
  renderQuestion,
  startRound,
} from "./demo-quiz.js";
import { extraStyle, renderExploreDownloads } from "./demo-save.js";
import { loadFeatures, loadWorldDetail } from "./dist/load-entry.js";
import { mountChizu } from "./dist/mount-entry.js";
import { codeFor } from "./tools.js";

// What the panels call in each other, given to demo-core before anything runs.
Object.assign(calls, { colourTones, docsLink, refreshAll, renderCode, renderInfo, renderNames, settings, startRound });

// ---- the code for this view ------------------------------------------------------------------------------
function renderCode() {
  if (!live.mount) return;
  const shownTones = Object.fromEntries(
    Object.entries(state.tones).filter(
      ([code, tone]) => !(state.part && tone === "faint" && !state.part.codes.includes(code)),
    ),
  );
  const features = featureOptions().features;
  const view = {
    mapKey: state.mapKey,
    mapId: state.map.id,
    language: language.lang,
    tones: shownTones,
    callouts: state.mode === "callouts" ? calloutRequest() : null,
    part: state.part ? { codes: state.part.codes } : null,
    features: features.length ? features : null,
  };
  seg(
    $("code-kind"),
    ["mount", "draw"],
    state.codeKind,
    (value) => {
      state.codeKind = value;
      renderCode();
    },
    (value) => say(value === "mount" ? "codeMount" : "codeDraw"),
  );
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
  seg(
    $("modes"),
    MODES,
    state.mode,
    (value) => chooseMode(value),
    (value) => say("modes")[value],
  );
  seg($("features"), FEATURE_MODES, state.features, chooseFeatures, (value) => say("featureModes")[value]);
  seg($("cities"), [false, true], state.cities, chooseCities, (value) => say(value ? "on" : "off"));
  seg(
    $("polish"),
    [false, true],
    state.polish,
    (value) => {
      state.polish = value;
      remember({ polish: value ? "on" : null });
      settings();
      applyCallouts();
    },
    (value) => say(value ? "on" : "off"),
  );
  seg(
    $("numbering"),
    ["given", "west-to-east"],
    state.numbering,
    (value) => {
      state.numbering = value;
      remember({ numbering: value === "west-to-east" ? value : null });
      settings();
      applyCallouts();
    },
    (value) => say("numberingOptions")[value],
  );
}

function chooseMode(mode) {
  state.mode = mode;
  for (const name of MODES) $(`panel-${name}`).hidden = name !== mode;
  remember({ mode: mode === "explore" ? null : mode });
  live.mount.set({ fit: true });
  if (mode === "quiz") {
    live.mount.set({ callouts: undefined });
    void startRound();
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
  live.mount?.set({ language: language.lang });
  renderInfo();
  renderNames();
  renderFeatures();
  renderExploreDownloads();
  if (live.mount && state.mode === "quiz") renderQuestion();
  if (live.mount && state.mode === "callouts") applyCallouts();
  if (live.mount && state.mode === "colour") renderColour();
  if (live.mount) {
    for (const button of document.querySelectorAll("[data-copy]")) button.textContent = say("copy");
  }
  renderCode();
  live.refreshCity?.();
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
  void startRound();
});
$("again").addEventListener("click", () => {
  void startRound();
});
$("copy-link").addEventListener("click", (event) => copyText($("share-link").value, event.currentTarget));
$("copy-code").addEventListener("click", (event) => copyText($("code").textContent, event.currentTarget));
$("figures").addEventListener("input", readFigures);
$("colour-example").addEventListener("click", colourExample);
matchMedia("(prefers-color-scheme: dark)").addEventListener?.(
  "change",
  () => state.mode === "colour" && renderColour(),
);

// The colours of a coloured map and of the parts, light and dark, for the map on the page.
document.head.append(
  el("style", {
    text: `${extraStyle("light")}\n@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) ${extraStyle("dark").replace(/\n/g, `\n:root:not([data-theme="light"]) `)} }\n:root[data-theme="dark"] ${extraStyle("dark").replace(/\n/g, `\n:root[data-theme="dark"] `)}`,
  }),
);

if (state.mapKey.startsWith("continent:")) {
  state.partKey = state.mapKey.slice("continent:".length);
  state.mapKey = "world";
}
state.map = await loadMap(state.mapKey);
await ensureLayer();
state.part = findPart(state.map, state.partKey);
live.mount = mountChizu(host, {
  map: state.map,
  language: language.lang,
  // From 4× in, the world is drawn from the finer 1:50m outlines, fetched the first time they are wanted.
  detail: loadWorldDetail,
  // Each map's seas, lakes and rivers, fetched the first time they are drawn.
  featureLayer: loadFeatures,
  ...featureOptions(),
  ...cityOptions(state.cities),
  onSelect: (code) => {
    if (state.mode === "quiz") {
      // Finding a place, a press on the sea is not an answer; finding the water, a press on the land is a wrong one.
      if (state.quiz.style === "find" && code !== null && regionOf(code) && !state.quiz.answered)
        answer(code, nameIn(regionOf(code)));
      if (state.quiz.style === "water" && code !== null && placeOf(code) && !state.quiz.answered)
        answer(code, nameIn(placeOf(code)));
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

function docsLink() {
  document
    .querySelector('[data-say="pageDocs"]')
    ?.setAttribute("href", language.lang === "ja" ? "docs/ja/index.html" : "docs/index.html");
}
docsLink();
live.refreshCity = initCity({ say, language, seg, remember, params });

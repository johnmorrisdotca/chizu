// The demo page's explore panel: the chosen place, the features and the list of names. Split from demo.js; the panels share one state object (demo-core.js).

import { $, el, featureOf, inPart, language, live, nameIn, placeOf, regionOf, say, state } from "./demo-core.js";
import { choosePart, coordinateText, groupIn, partsOf } from "./demo-maps.js";
import { downloadRow, viewName } from "./demo-save.js";
import { featureKindOf, findFeatures, unprojectPoint } from "./dist/index.js";
import { toMarkdown, toSql } from "./downloads.js";
import { foldAnswer, toCsv, toJson, toText } from "./tools.js";

/**
 * The card for the chosen place, in one box whose height never changes: a name line, a line of what is known about it
 * (its reading, ISO code, part and centre), and a row of the places it touches, which scrolls sideways. With nothing
 * chosen the same three lines say what the map holds, how to choose, and the map's parts to press.
 */
export function renderInfo() {
  const info = $("info");
  const region = state.selected ? placeOf(state.selected) : null;
  const line = (props, text) => el("p", { ...props, text });
  const row = (label, ...chips) =>
    el("div", { class: "info-row" }, label ? el("span", { class: "fam-label", text: label }) : null, ...chips);
  if (!region) {
    const title = language.lang === "ja" ? (state.map.nameJa ?? state.map.name) : state.map.name;
    const parts = partsOf(state.map).filter((part) => part.kind !== "subregion");
    info.replaceChildren(
      line(
        { class: "info-name", "data-testid": "info-name" },
        say("infoMap", title, inPart().length, state.map.kind === "world" ? say("whatCountries") : say("whatPlaces")),
      ),
      line({ class: "fam-muted info-meta" }, say("nothingChosen")),
      row(
        parts.length ? say("part") : null,
        ...parts.map((part) =>
          el("button", {
            type: "button",
            class: "fam-chip",
            "data-part": part.key,
            "aria-pressed": String(state.part?.key === part.key),
            text: language.lang === "ja" ? (part.nameJa ?? part.name) : part.name,
            on: {
              click: () => {
                $("part").value = state.part?.key === part.key ? "" : part.key;
                choosePart($("part").value);
              },
            },
          }),
        ),
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
      ? row(
          say("touches"),
          ...region.neighbors
            .filter((code) => regionOf(code) && !regionOf(code).unnamed)
            .map((code) =>
              el("button", {
                type: "button",
                class: "fam-chip",
                "data-code": code,
                text: nameIn(regionOf(code)),
                on: { click: () => choosePlace(code) },
              }),
            ),
        )
      : row(null, el("span", { class: "fam-muted", text: say("noNeighbours") })),
  );
}

/** The card for a chosen sea, lake, river, landform or peak: its names, its kind and reading, and the water it touches. */
export function renderFeatureInfo(feature) {
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
      ? el(
          "div",
          { class: "info-row" },
          el("span", { class: "fam-label", text: say("touches") }),
          ...near.map((other) =>
            el("button", {
              type: "button",
              class: "fam-chip",
              "data-code": other.code,
              text: nameIn(other),
              on: { click: () => choosePlace(other.code) },
            }),
          ),
        )
      : el("div", { class: "info-row" }),
  );
}

/** The features of the map, or those a search finds, in a list whose height never changes; and their downloads. */
export function renderFeatures() {
  const tbody = document.querySelector("#feature-list tbody");
  const all = state.layer?.features ?? [];
  const typed = $("feature-find").value;
  const rows = typed.trim() === "" ? all : findFeatures(all, typed, { limit: 50 });
  $("feature-count").textContent = all.length === 0 ? say("featureNone") : say("featureCount", rows.length, all.length);
  tbody.replaceChildren(
    ...rows.map((feature) =>
      el(
        "tr",
        {
          "data-code": feature.code,
          "aria-selected": String(feature.code === state.selected),
          tabindex: "0",
          on: {
            click: () => choosePlace(feature.code),
            keydown: (event) => event.key === "Enter" && choosePlace(feature.code),
          },
        },
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
    {
      format: "csv",
      type: "text/csv",
      name: viewName("features"),
      make: () => toCsv(columns, state.layer?.features ?? []),
    },
    {
      format: "json",
      type: "application/json",
      name: viewName("features"),
      make: () =>
        toJson(columns, state.layer?.features ?? [], { map: state.map.id, source: state.layer?.source ?? null }),
    },
    {
      format: "txt",
      type: "text/plain",
      name: viewName("features"),
      make: () => toText(title, columns, state.layer?.features ?? []),
    },
    {
      format: "md",
      type: "text/markdown",
      name: viewName("features"),
      make: () => toMarkdown(columns, state.layer?.features ?? []),
    },
    {
      format: "sql",
      type: "application/sql",
      name: viewName("features"),
      make: () => toSql("features", columns, state.layer?.features ?? []),
    },
  ]);
}

export function renderNames() {
  const tbody = document.querySelector("#names tbody");
  const needle = foldAnswer($("filter").value);
  const rows = inPart().filter(
    (region) =>
      needle === "" ||
      [
        region.name,
        region.nameJa,
        region.nameShortJa,
        region.reading,
        region.code,
        region.iso,
        region.group,
        region.groupJa,
        ...(region.groupAliases ?? []),
      ].some((text) => foldAnswer(text ?? "").includes(needle)),
  );
  tbody.replaceChildren(
    ...rows.map((region) => {
      const tr = el(
        "tr",
        {
          "data-code": region.code,
          "aria-selected": String(region.code === state.selected),
          tabindex: "0",
          on: {
            click: () => choosePlace(region.code),
            keydown: (event) => event.key === "Enter" && choosePlace(region.code),
          },
        },
        el("td", { class: "fam-code", text: region.code }),
        el("td", { class: "fam-code", text: region.iso ?? "" }),
        el("td", { text: region.name }),
        el("td", {
          lang: "ja",
          text: region.nameShortJa ? `${region.nameShortJa}（${region.nameJa}）` : (region.nameJa ?? ""),
        }),
        el("td", { lang: "ja", text: region.reading ?? "" }),
        el("td", { text: groupIn(region) }),
      );
      return tr;
    }),
  );
}

export function choosePlace(code) {
  if (state.mode !== "explore") return;
  state.selected = code;
  live.mount.select(code);
  renderInfo();
  renderNames();
  renderFeatures();
}

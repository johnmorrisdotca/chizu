// The demo page's colour panel: a map shaded from pasted figures. Split from demo.js; the panels share one state object (demo-core.js).

import {
  $,
  dark,
  el,
  GROUP_COLOURS,
  inPart,
  language,
  regionOf,
  remember,
  STEP_COLOURS,
  say,
  seg,
  state,
} from "./demo-core.js";
import { paint } from "./demo-maps.js";
import { currentSvg, downloadRow, svgToPng, viewName } from "./demo-save.js";
import { regionGroups } from "./dist/index.js";
import { toMarkdown, toSql } from "./downloads.js";
import { figureSteps, figureText, foldAnswer, isNameOf, parseFigures, toCsv, toJson, toText } from "./tools.js";

// ---- colour ------------------------------------------------------------------------------------------------
/** A place's words to its code: its code, its ISO code, or any of its names, in the part in view. */
export function findPlace(words) {
  const folded = foldAnswer(words);
  if (folded === "") return null;
  const region =
    inPart().find((one) => [one.code, one.iso].some((code) => code && foldAnswer(code) === folded)) ??
    inPart().find((one) => isNameOf(words, one));
  return region?.code ?? null;
}

export function readFigures() {
  const text = $("figures").value;
  state.figures = {
    ...parseFigures(text, findPlace),
    lines: text.split(/\r?\n/).filter((line) => line.trim() !== "").length,
  };
  remember({ colour: state.colourBy === "groups" ? "groups" : null });
  renderColour();
  paint();
}

export function colourTones() {
  if (state.colourBy === "groups") {
    const groups = regionGroups({ regions: inPart() });
    const tones = {};
    groups.forEach((group, index) => {
      group.codes.forEach((code) => {
        tones[code] = `group${(index % GROUP_COLOURS.light.length) + 1}`;
      });
    });
    return tones;
  }
  const { stepOf } = figureSteps(state.figures.rows);
  const tones = {};
  for (const [code, step] of stepOf) tones[code] = `step${step}`;
  return tones;
}

export function renderColour() {
  seg(
    $("colour-by"),
    ["figures", "groups"],
    state.colourBy,
    (value) => {
      state.colourBy = value;
      remember({ colour: value === "groups" ? "groups" : null });
      renderColour();
      paint();
    },
    (value) => say("colourModes")[value],
  );
  $("figures-row").hidden = state.colourBy !== "figures";
  const status = $("colour-status");
  const legend = $("colour-legend");
  const theme = dark() ? "dark" : "light";
  if (state.colourBy === "groups") {
    const groups = regionGroups({ regions: inPart() });
    status.replaceChildren();
    legend.replaceChildren(
      ...groups.map((group, index) =>
        el(
          "li",
          { "data-group": group.code },
          el("span", {
            class: "swatch",
            style: `background:${GROUP_COLOURS[theme][index % GROUP_COLOURS[theme].length]}`,
          }),
          el("span", {
            text: `${language.lang === "ja" ? (group.nameJa ?? group.name) : group.name} (${group.codes.length})`,
          }),
        ),
      ),
    );
  } else {
    const { rows, missing, noNumber, lines } = state.figures;
    const { steps } = figureSteps(rows);
    status.replaceChildren(
      ...[
        el("p", {
          "data-testid": "colour-count",
          text: lines === 0 ? say("colourEmpty") : say("colourCount", rows.length, lines),
        }),
        missing.length
          ? el("p", {
              class: "fam-error",
              "data-testid": "colour-missing",
              text: say("colourMissing", missing.join(", ")),
            })
          : null,
        noNumber.length
          ? el("p", {
              class: "fam-error",
              "data-testid": "colour-bad-number",
              text: say("colourBadNumber", noNumber.join(", ")),
            })
          : null,
      ].filter(Boolean),
    );
    legend.replaceChildren(
      ...steps.map((step) =>
        el(
          "li",
          { "data-step": String(step.step) },
          el("span", { class: "swatch", style: `background:${STEP_COLOURS[theme][step.step - 1]}` }),
          el("span", {
            text: `${say("colourStep", figureText(step.from, language.lang), figureText(step.to, language.lang))} (${step.count})`,
          }),
        ),
      ),
    );
  }
  const { stepOf } = figureSteps(state.figures.rows);
  const figureRows = () =>
    state.figures.rows.map((row) => ({
      code: row.code,
      iso: regionOf(row.code)?.iso ?? "",
      name: regionOf(row.code)?.name ?? "",
      nameJa: regionOf(row.code)?.nameJa ?? "",
      value: row.value,
      step: stepOf.get(row.code),
    }));
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
    {
      format: "json",
      type: "application/json",
      name: viewName("figures"),
      make: () => toJson(columns, figureRows(), { map: state.map.id }),
    },
    {
      format: "txt",
      type: "text/plain",
      name: viewName("figures"),
      make: () => toText(state.map.name, columns, figureRows()),
    },
    { format: "md", type: "text/markdown", name: viewName("figures"), make: () => toMarkdown(columns, figureRows()) },
    {
      format: "sql",
      type: "application/sql",
      name: viewName("figures"),
      make: () => toSql("figures", columns, figureRows()),
    },
  ]);
}

/** The example: how many places each place touches on this map, which the map itself knows. */
export function colourExample() {
  $("figures").value = inPart()
    .map(
      (region) =>
        `${region.iso ?? region.code}, ${region.neighbors.filter((code) => inPart().some((other) => other.code === code)).length}`,
    )
    .join("\n");
  readFigures();
}

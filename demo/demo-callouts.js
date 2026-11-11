// The demo page's callout sheets: the numbered places and their list. Split from demo.js; the panels share one state object (demo-core.js).

import { renderCode } from "./demo.js";
import { $, el, inPart, live, nameIn, regionOf, say, state, TWENTY } from "./demo-core.js";
import { currentSvg, downloadRow, svgToPng, viewName } from "./demo-save.js";
import { toMarkdown, toSql } from "./downloads.js";
import { toCsv, toJson, toText } from "./tools.js";

// ---- callouts ----------------------------------------------------------------------------------------------
export function calloutCodes() {
  const regions = inPart();
  if (state.map.kind === "world" && !state.part) return TWENTY.filter((code) => regionOf(code));
  if (regions.length <= 30) return regions.map((region) => region.code);
  const area = (region) => (region.bbox[2] - region.bbox[0]) * (region.bbox[3] - region.bbox[1]);
  return [...regions]
    .sort((a, b) => area(b) - area(a))
    .slice(0, 30)
    .map((region) => region.code);
}

export function calloutRequest() {
  const codes = calloutCodes();
  // The world is a thousand units across and holds twenty numbers, and a country may hold thirty: smaller circles than one with sixteen.
  const radiusRatio =
    state.map.kind === "world" && !state.part
      ? 0.016
      : Math.max(0.014, 0.03 * Math.sqrt(Math.min(1, 16 / codes.length)));
  return {
    codes,
    polish: state.polish,
    numbering: state.numbering,
    radiusRatio: Math.round(radiusRatio * 10000) / 10000,
  };
}

export function orderedCallouts() {
  const codes = calloutCodes();
  return state.numbering === "west-to-east"
    ? [...codes].sort(
        (a, b) =>
          regionOf(a).centroid[0] - regionOf(b).centroid[0] || regionOf(a).centroid[1] - regionOf(b).centroid[1],
      )
    : codes;
}

export function applyCallouts() {
  if (state.mode !== "callouts") {
    live.mount.set({ callouts: undefined });
    renderCode();
    return;
  }
  live.mount.set({ callouts: calloutRequest() });
  $("legend").replaceChildren(
    ...orderedCallouts().map((code) => el("li", { "data-code": code, text: nameIn(regionOf(code)) })),
  );
  renderCode();
  const legendRows = () =>
    orderedCallouts().map((code, index) => ({
      number: index + 1,
      code,
      iso: regionOf(code).iso ?? "",
      name: regionOf(code).name,
      nameJa: regionOf(code).nameJa ?? "",
      reading: regionOf(code).reading ?? "",
    }));
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
    {
      format: "json",
      type: "application/json",
      name: viewName("callouts"),
      make: () => toJson(columns, legendRows(), { map: state.map.id }),
    },
    {
      format: "txt",
      type: "text/plain",
      name: viewName("callouts"),
      make: () => toText(state.map.name, columns, legendRows()),
    },
    { format: "md", type: "text/markdown", name: viewName("callouts"), make: () => toMarkdown(columns, legendRows()) },
    {
      format: "sql",
      type: "application/sql",
      name: viewName("callouts"),
      make: () => toSql("callouts", columns, legendRows()),
    },
  ]);
}

/** A sheet to print: the map with its numbered callouts, and under it the numbered list, as one SVG. */
export function calloutSheet() {
  const map = currentSvg({ callouts: calloutRequest() });
  const width = Number(map.match(/ width="(\d+)"/)[1]);
  const height = Number(map.match(/ height="(\d+)"/)[1]);
  const names = orderedCallouts().map((code) => nameIn(regionOf(code)));
  const columns = 3;
  const line = 30;
  const rows = Math.ceil(names.length / columns);
  const legendHeight = rows * line + 40;
  const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const items = names.map(
    (name, index) =>
      `<text x="${24 + (index % columns) * (width / columns)}" y="${height + 34 + Math.floor(index / columns) * line}" font-size="18" font-family="system-ui, -apple-system, 'Hiragino Sans', 'Noto Sans JP', sans-serif" fill="#1f2320"><tspan font-weight="700">${index + 1}</tspan>  ${escapeHtml(name)}</text>`,
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + legendHeight}" viewBox="0 0 ${width} ${height + legendHeight}"><rect width="100%" height="100%" fill="#ffffff"/>${map.replace("<svg ", '<svg x="0" y="0" ')}${items.join("")}</svg>`;
}

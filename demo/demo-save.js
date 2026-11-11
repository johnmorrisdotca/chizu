// The demo page's downloads: the map as SVG or PNG, and the places as tables. Split from demo.js; the panels share one state object (demo-core.js).

import { $, el, GROUP_COLOURS, inPart, language, live, STEP_COLOURS, say, state } from "./demo-core.js";
import { drawChizu } from "./dist/draw-entry.js";
import { toMarkdown, toSql } from "./downloads.js";
import { fileName, toCsv, toJson, toText } from "./tools.js";

// ---- downloads -----------------------------------------------------------------------------------------------
/** Hand the reader a file: text, or a Blob. */
export function save(name, type, body) {
  const blob = body instanceof Blob ? body : new Blob([body], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = el("a", { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The colours the map needs beyond the drawing's own, as CSS: the steps of a coloured map and the colours of its parts. */
export function extraStyle(theme) {
  const steps = STEP_COLOURS[theme].map(
    (colour, index) => `.chizu .cz-tone-step${index + 1} .cz-land { fill: ${colour}; }`,
  );
  const groups = GROUP_COLOURS[theme].map(
    (colour, index) => `.chizu .cz-tone-group${index + 1} .cz-land { fill: ${colour}; }`,
  );
  return [...steps, ...groups].join("\n");
}

/** The map as it is drawn now, as a standalone SVG in the light look: the window, the tones, any callouts, with the style inside. */
export function currentSvg({ callouts = null, labels = false } = {}) {
  const box = live.mount.view().box;
  const svg = drawChizu(state.map, {
    box,
    tones: state.tones,
    language: language.lang,
    style: true,
    labels,
    ...(callouts ? { callouts } : {}),
  });
  const width = 1200;
  const height = Math.round((width * box.height) / box.width);
  return svg
    .replace("<svg ", `<svg width="${width}" height="${height}" data-theme="light" `)
    .replace("</style>", `\n${extraStyle("light")}</style>`);
}

/** A standalone SVG made a PNG, twice its size, through a canvas: nothing leaves the page. */
export async function svgToPng(svg) {
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

export const FORMAT_LABELS = { md: "Markdown", sql: "SQL" };

/** A row of buttons, one for each kind of file a thing can be downloaded as. */
export function downloadRow(container, testid, label, files) {
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
export function placeTable() {
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

export const viewName = (...more) => fileName("chizu", state.map.id, state.part?.name, ...more);

export function renderExploreDownloads() {
  downloadRow($("explore-map-files"), "download-map", say("downloadMap"), [
    { format: "svg", type: "image/svg+xml", name: viewName("map"), make: () => currentSvg({ labels: true }) },
    { format: "png", type: "image/png", name: viewName("map"), make: () => svgToPng(currentSvg({ labels: true })) },
  ]);
  const title = `${language.lang === "ja" ? (state.map.nameJa ?? state.map.name) : state.map.name}${state.part ? ` · ${language.lang === "ja" ? (state.part.nameJa ?? state.part.name) : state.part.name}` : ""}`;
  downloadRow($("explore-list-files"), "download-list", say("downloadList"), [
    {
      format: "csv",
      type: "text/csv",
      name: viewName("places"),
      make: () => toCsv(placeTable().columns, placeTable().rows),
    },
    {
      format: "json",
      type: "application/json",
      name: viewName("places"),
      make: () => toJson(placeTable().columns, placeTable().rows, { map: state.map.id, part: state.part?.key ?? null }),
    },
    {
      format: "txt",
      type: "text/plain",
      name: viewName("places"),
      make: () => toText(title, placeTable().columns, placeTable().rows),
    },
    {
      format: "md",
      type: "text/markdown",
      name: viewName("places"),
      make: () => toMarkdown(placeTable().columns, placeTable().rows),
    },
    {
      format: "sql",
      type: "application/sql",
      name: viewName("places"),
      make: () => toSql("places", placeTable().columns, placeTable().rows),
    },
  ]);
}

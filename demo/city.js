// The demo's city scale: a made-up ground (not OpenStreetMap, not a survey) drawn from GeoJSON and a picture in metres,
// at four scales: Japan's map at 10x, then 20 km, 2 km and 400 m across, each a local map of the same ground. The
// country step shows the box the next step covers, worked out by mapBoxFromLocal.
import { localMap, mapBoxFromLocal, mapBoxMetres, projectPoint, zoomBox } from "./dist/index.js";
import { drawChizu, drawLocal } from "./dist/draw-entry.js";
import { loadCountry } from "./dist/load-entry.js";

export const CITY_CENTRE = [139.7006, 35.7004];
const SCALES = ["country", 20000, 2000, 400];

const ring = (lon, lat, rx, ry, n = 14) => Array.from({ length: n + 1 }, (_, i) => [lon + rx * Math.cos((2 * Math.PI * (i % n)) / n), lat + ry * Math.sin((2 * Math.PI * (i % n)) / n)]);
const box = (w, s, e, n) => [[w, s], [e, s], [e, n], [w, n], [w, s]];

/** The made-up ground: a park, a pond, a hall, two lanes and two gates. */
export const GROUND = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", id: "park", properties: { kind: "green" }, geometry: { type: "Polygon", coordinates: [box(139.6982, 35.6986, 139.703, 35.7022)] } },
    { type: "Feature", id: "pond", properties: { name: "Pond", nameJa: "池", kind: "water" }, geometry: { type: "Polygon", coordinates: [ring(139.6993, 35.6996, 0.0004, 0.0003)] } },
    { type: "Feature", id: "hall", properties: { name: "Main hall", nameJa: "本館", kind: "building", class: "stand" }, geometry: { type: "Polygon", coordinates: [box(139.701, 35.7008, 139.7022, 35.7016)] } },
    { type: "Feature", id: "lane-west", properties: { kind: "road" }, geometry: { type: "LineString", coordinates: [[139.6984, 35.699], [139.6998, 35.7001], [139.7006, 35.7003], [139.7026, 35.7003]] } },
    { type: "Feature", id: "lane-north", properties: { kind: "road" }, geometry: { type: "LineString", coordinates: [[139.7006, 35.6988], [139.7006, 35.7003], [139.701, 35.702]] } },
    { type: "Feature", id: "gate-south", properties: { name: "South gate", nameJa: "南門" }, geometry: { type: "Point", coordinates: [139.7006, 35.6989] } },
    { type: "Feature", id: "gate-north", properties: { name: "North gate", nameJa: "北門" }, geometry: { type: "Point", coordinates: [139.701, 35.7019] } },
  ],
};

const PITCH = '<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#8fc77d" stroke="#fff" stroke-width="0.4"/><line x1="30" y1="0" x2="30" y2="40" stroke="#fff" stroke-width="0.4"/><circle cx="30" cy="20" r="5" fill="none" stroke="#fff" stroke-width="0.4"/></svg>';
const STYLES = { road: { widthMetres: 5, stroke: "#b9b09a", dark: { stroke: "#6f6a5a" } }, stand: { fill: "#d9a441", dark: { fill: "#8a6a24" } } };

/** The ground as a local map `width` metres across, with the pitch turned to `bearing`. */
export function groundMap(width, bearing, name) {
  return localMap({
    centre: CITY_CENTRE,
    widthMetres: width,
    name,
    data: GROUND,
    markers: [{ id: "pitch", name: "Pitch", nameJa: "ピッチ", at: [139.7, 35.701], svg: PITCH, bearing }],
    credits: ["Made-up shapes for this demo"],
  });
}

const metresWords = (metres) => (metres >= 1000 ? `${Math.round(metres / 100) / 10} km` : `${Math.round(metres)} m`);

/** Wire the section; returns a function that draws it again (after the language changes). */
export function initCity({ say, language, seg, remember, params }) {
  const state = { scale: SCALES.map(String).includes(params.get("city")) ? params.get("city") : "country", names: params.get("cityNames") === "on", numbers: params.get("cityNumbers") === "on", bearing: Math.min(359, Math.max(0, Number(params.get("bearing")) || 30)) };
  const host = document.getElementById("city-board");
  const status = document.getElementById("city-status");
  const slider = document.getElementById("city-bearing");
  const out = document.getElementById("city-bearing-out");
  let japan = null;

  async function draw() {
    const lang = language.lang;
    slider.value = String(state.bearing);
    out.textContent = `${state.bearing}°`;
    if (state.scale === "country") {
      japan ??= await loadCountry("jp");
      const [x, y] = projectPoint(japan, CITY_CENTRE[0], CITY_CENTRE[1]);
      const window = zoomBox(japan, 10, { x, y });
      const next = mapBoxFromLocal(japan, groundMap(SCALES[1], state.bearing));
      let svg = drawChizu(japan, { box: window, language: lang, style: true, label: say("cityCountryLabel") });
      const mark = `<rect class="city-footprint" x="${next.x}" y="${next.y}" width="${next.width}" height="${next.height}" fill="none" stroke="#b5452c" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
      svg = svg.replace("</svg>", `${mark}</svg>`);
      host.innerHTML = svg;
      const across = mapBoxMetres(japan, window).width;
      status.textContent = say("cityStatus", metresWords(across), metresWords(across / window.width));
    } else {
      const width = Number(state.scale);
      const map = groundMap(width, state.bearing);
      host.innerHTML = drawLocal(map, { language: lang, style: true, labels: state.names, callouts: state.numbers ? ["hall", "pond", "gate-north", "pitch"] : undefined, styles: STYLES });
      status.textContent = say("cityStatus", metresWords(width), metresWords(map.projection.metresPerUnit));
    }
    host.dataset.scale = state.scale;
    host.dataset.ready = "true";
  }

  function controls() {
    seg(document.getElementById("city-scale"), SCALES.map(String), state.scale, (value) => {
      state.scale = value;
      remember({ city: value === "country" ? null : value });
      controls();
      draw();
    }, (value) => (value === "country" ? say("cityCountry") : metresWords(Number(value))));
    seg(document.getElementById("city-names"), [false, true], state.names, (value) => {
      state.names = value;
      remember({ cityNames: value ? "on" : null });
      controls();
      draw();
    }, (value) => say(value ? "on" : "off"));
    seg(document.getElementById("city-numbers"), [false, true], state.numbers, (value) => {
      state.numbers = value;
      remember({ cityNumbers: value ? "on" : null });
      controls();
      draw();
    }, (value) => say(value ? "on" : "off"));
  }

  slider.addEventListener("input", () => {
    state.bearing = Number(slider.value);
    remember({ bearing: state.bearing === 30 ? null : state.bearing });
    draw();
  });
  controls();
  draw();
  return () => {
    controls();
    draw();
  };
}

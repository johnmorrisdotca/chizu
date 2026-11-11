// The demo's overlays: the night side for the present moment, a sample track round the world in two tones, and a mark
// where it is now. The page works the numbers out; the map only draws them (overlays in mountChizu).

import { language, live, remember, state } from "./demo-core.js";

const RAD = Math.PI / 180;

/** The point the Sun is straight over at a moment: a plain approximation, good to a degree, enough for a picture. */
function subsolar(date) {
  const day = (date - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000;
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60;
  return [declination, -15 * (hours - 12)];
}

/** The night side as a ring: the edge of daylight from -180 to 180, closed along the pole that is in the dark. */
export function nightRing(date) {
  const [declination, sunLon] = subsolar(date);
  const tilt = Math.tan((Math.abs(declination) < 0.1 ? 0.1 : declination) * RAD);
  const edge = [];
  for (let lon = -180; lon <= 180; lon += 4) edge.push([Math.atan(-Math.cos((lon - sunLon) * RAD) / tilt) / RAD, lon]);
  const pole = declination > 0 ? -90 : 90;
  return [...edge, [pole, 180], [pole, -180]];
}

/** A sample track: a satellite at 51.6° going round, its last half orbit and the next one, and where it is now. */
export function sampleOverlays(date = new Date()) {
  const start = ((date.getUTCMinutes() * 6) % 360) - 180;
  const at = (step) => {
    const lon = start + step;
    return [51.6 * Math.sin(step * RAD), ((((lon + 180) % 360) + 360) % 360) - 180];
  };
  const past = [];
  const coming = [];
  for (let step = -180; step <= 0; step += 3) past.push(at(step));
  for (let step = 0; step <= 360; step += 3) coming.push(at(step));
  return [
    { kind: "area", ring: nightRing(date), opacity: 0.3, id: "night" },
    { kind: "line", points: past, color: "#8a8f98", width: 2, id: "past" },
    { kind: "line", points: coming, color: "#c0392b", width: 2, dash: [5, 4], id: "coming" },
    { kind: "mark", at: at(0), label: language.lang === "ja" ? "いま" : "Now", color: "#c0392b", size: 10, id: "now" },
  ];
}

/** The overlays of the demo's present setting: none unless they are on. */
export const overlayOptions = (on) => ({ overlays: on ? sampleOverlays() : [] });

export function chooseOverlays(value) {
  state.overlays = value;
  remember({ overlays: value ? "on" : null });
  live.mount.set(overlayOptions(value));
}

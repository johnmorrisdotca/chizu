import { COUNTRY_CODES, DIVISIONS_CODES } from "./dist/load-entry.js";
import { readMapData } from "./dist/element.js";
export const regions = ["world", ...DIVISIONS_CODES.map((code) => `divisions-${code.toLowerCase()}`), ...COUNTRY_CODES.map((code) => `country-${code.toLowerCase()}`)];
export const choices = { region: regions, size: ["small", "medium", "large"], theme: ["auto", "light", "dark"], lang: ["en", "ja"], features: ["none", "water", "all"] };
export function validatedAttributes(query, observed) {
  const attrs = [];
  const available = new Set(observed);
  for (const [name, values] of Object.entries(choices)) if (available.has(name) && values.includes(query.get(name))) attrs.push([name, query.get(name)]);
  for (const name of ["labels", "controls", "selectable"]) if (available.has(name) && query.has(name)) {
    const value = query.get(name).trim().toLowerCase();
    if (["", "on", "true", "1", "off", "false", "no", "0"].includes(value)) attrs.push([name, ["off", "false", "no", "0"].includes(value) ? "false" : ""]);
  }
  for (const [name, min, max] of [["width", 100, 2000], ["zoom", 1, 10], ["seed", 0, 4294967295]]) {
    const value = Number(query.get(name));
    if (available.has(name) && query.has(name) && Number.isFinite(value) && Number.isInteger(value) && value >= min && value <= max) attrs.push([name, String(value)]);
  }
  if (available.has("data") && query.has("data") && readMapData(query.get("data")) !== null) attrs.push(["data", query.get("data")]);
  if (available.has("highlight") && /^[\w\s,-]{0,1000}$/.test(query.get("highlight") ?? "")) attrs.push(["highlight", query.get("highlight") ?? ""]);
  const place = query.get("place");
  if (available.has("place") && place !== null && place.length <= 100 && (/^[\w-]+$/.test(place) || /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(place))) attrs.push(["place", place]);
  if (query.has("label") && query.get("label").length <= 200) attrs.push(["label", query.get("label")]);
  return attrs;
}

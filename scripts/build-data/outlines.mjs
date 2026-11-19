import { polygonsOf } from "../build-data.mjs";
import { CUT_OUTLINES } from "../data-config.mjs";
import { source } from "../natural-earth.mjs";
import { neighboursBySharedPoints } from "./geometry.mjs";
import { countriesFrom } from "./world.mjs";

/**
 * Antarctica's ring runs down the antimeridian to the pole, along it and back up, a slit a projection centred on the
 * pole draws as a line from the coast to the middle. Without the points inside that run, the ring closes on itself at
 * the coast and still goes round the pole. A ring that does not reach the pole is as it was.
 */
function withoutPoleCut(ring) {
  const onCut = ([lon, lat]) => Math.abs(lon) === 180 || lat <= -89.99;
  if (!ring.some(([, lat]) => lat <= -89.99)) return ring;
  return ring.filter((point, i) => !onCut(point) || !onCut(ring.at(i - 1)) || !onCut(ring[(i + 1) % ring.length]));
}

/**
 * The 1:50m countries with the places CUT_OUTLINES names after them, each one's neighbours (shared points among the
 * countries, and the cut places' both ways, `cutNeighbours`) and the cut places' codes.
 */
export async function withCutOutlines(countriesSource, fineSource) {
  const drawn = countriesFrom(countriesSource);
  const cuts = await cutOutlines();
  const twice = cuts.filter((cut) => drawn.some((feature) => feature.properties.__code === cut.properties.__code));
  if (twice.length > 0)
    throw new Error(`the 1:50m countries draw ${twice.map((cut) => cut.properties.__code)} already`);
  const touching = cutNeighbours(cuts, drawn, countriesFrom(fineSource));
  const countries = [...drawn, ...cuts];
  const near = [...neighboursBySharedPoints(drawn, (feature) => feature.properties.__code), ...cuts.map(() => [])].map(
    (codes, index) => [...codes, ...(touching.get(countries[index].properties.__code) ?? [])].sort(),
  );
  return { countries, near, cutCodes: new Set(cuts.map((cut) => cut.properties.__code)) };
}

/** The places CUT_OUTLINES names, each one feature with its code, the file it was cut from (`__file`) and its pieces together. */
async function cutOutlines() {
  const files = new Map();
  const cuts = [];
  for (const [code, { file, field, values }] of Object.entries(CUT_OUTLINES)) {
    if (!files.has(file)) files.set(file, await source(file));
    const found = files.get(file).features.filter((feature) => values.includes(feature.properties[field]));
    if (found.length !== values.length) throw new Error(`${code}: ${file} has ${found.length} of ${values.join(" ")}`);
    cuts.push({
      type: "Feature",
      properties: { ...found[0].properties, __code: code, __file: file },
      geometry: {
        type: "MultiPolygon",
        coordinates: found.flatMap((feature) => polygonsOf(feature.geometry)).map((rings) => rings.map(withoutPoleCut)),
      },
    });
  }
  return cuts;
}

/**
 * The countries each cut place shares a border point with, at the scale it was cut at, and the reverse, by code. Its
 * own sovereign's outline holds it (France's holds French Guiana), so it is not counted as a neighbour.
 */
function cutNeighbours(cuts, countries, fineCountries) {
  const known = new Set(countries.map((feature) => feature.properties.__code));
  const touching = new Map();
  const add = (a, b) => touching.set(a, [...(touching.get(a) ?? []), b].sort());
  for (const [scale, others] of [
    ["_50m_", countries],
    ["_10m_", fineCountries],
  ]) {
    const here = cuts.filter((cut) => cut.properties.__file.includes(scale));
    const all = [...others.filter((feature) => known.has(feature.properties.__code)), ...here];
    const near = neighboursBySharedPoints(all, (feature) => feature);
    for (const [index, feature] of all.entries()) {
      if (!here.includes(feature)) continue;
      for (const other of near[index]) {
        if (other.properties.SOV_A3 === feature.properties.SOV_A3) continue;
        add(feature.properties.__code, other.properties.__code);
        if (!here.includes(other)) add(other.properties.__code, feature.properties.__code);
      }
    }
  }
  return touching;
}

// The world of 1 January 1990 (MODULES-1622), drawn from today's shapes on the world's own canvas: the Soviet Union,
// Yugoslavia and Czechoslovakia are the union of today's countries along the borders they share (1:110m, as the world is),
// and East and West Germany and the two Yemens are the unions of today's regions (Natural Earth's 1:10m admin-1), which
// is how a line that no longer exists inside a country is found. See scripts/data-config/world1990.mjs.
import { join } from "node:path";
import { geoArea, geoPath } from "d3-geo";
import { isoOf } from "../build-data.mjs";
import { JOINED, NATURAL_EARTH, SPLIT } from "../data-config.mjs";
import { union } from "./dissolve.mjs";
import { CONTINENTS, out, regionOf, writeMap } from "./geometry.mjs";
import { countriesFrom, projections } from "./world.mjs";

/** The union of geometries, its area checked against the sum of its parts so that a border that did not quite meet stops the build. */
function joined(geometries, what) {
  const whole = union(geometries);
  const sum = geometries.reduce((total, geometry) => total + geoArea({ type: "Feature", geometry }), 0);
  if (Math.abs(geoArea({ type: "Feature", geometry: whole }) - sum) > sum * 1e-9)
    throw new Error(`${what}: the union's area is not its parts'`);
  return { type: "Feature", properties: {}, geometry: whole };
}

/** The world in 1990, from the world (`world`, 1:110m), its countries' source and Natural Earth's regions. */
export function buildWorld1990(worldSource, divisionsSource, world) {
  const draw = geoPath(projections.get("world"));
  const byCode = new Map(countriesFrom(worldSource).map((feature) => [feature.properties.__code, feature]));
  const groupJa = (group) => world.regions.find((region) => region.group === group)?.groupJa;
  const made = [];
  const add = (code, config, feature, neighbors) =>
    made.push(
      regionOf(draw, feature, {
        code,
        name: config.name,
        nameJa: config.nameJa,
        reading: config.reading,
        group: config.group,
        groupJa: groupJa(config.group),
        iso3: config.iso3,
        path: "",
        neighbors,
      }),
    );
  const removed = new Set();
  const membersOf = new Map();
  for (const [code, config] of Object.entries(JOINED)) {
    const parts = config.from.map((member) => {
      const feature = byCode.get(member);
      if (!feature) throw new Error(`the 1:110m world has no ${member} to join into ${code}`);
      return feature;
    });
    for (const member of config.from) removed.add(member);
    membersOf.set(code, config.from);
    add(
      code,
      config,
      joined(
        parts.map((part) => part.geometry),
        code,
      ),
      [],
    );
  }
  for (const [country, split] of Object.entries(SPLIT)) {
    const states = divisionsSource.features.filter(
      (feature) => isoOf({ ISO_A2_EH: feature.properties.iso_a2 }) === country,
    );
    const named = new Set(Object.values(split.parts).flatMap((part) => part.from ?? []));
    for (const [code, part] of Object.entries(split.parts)) {
      const own = states.filter((state) =>
        part.from ? part.from.includes(state.properties.iso_3166_2) : !named.has(state.properties.iso_3166_2),
      );
      if (own.length === 0 || (part.from && own.length !== part.from.length))
        throw new Error(`${code}: ${own.length} regions of ${country} found`);
      add(
        code,
        { ...part, group: split.group },
        joined(
          own.map((state) => state.geometry),
          code,
        ),
        part.neighbors,
      );
    }
    removed.add(country);
  }
  const front = new Map(made.map((region) => [region.code, region]));
  /** Where a country that bordered one of the changed ones borders now. */
  const remap = (owner, codes) => {
    const out = new Set();
    for (const code of codes) {
      const union = [...membersOf].find(([, members]) => members.includes(code))?.[0];
      if (union) out.add(union);
      else if (code === "DE") out.add(owner === "PL" ? "DDDE" : "DE");
      else if (code === "YE") out.add("YE").add("YDYE");
      else out.add(code);
    }
    return [...out].filter((code) => code !== owner).sort();
  };
  const kept = world.regions
    .filter((region) => !removed.has(region.code))
    .map((region) => ({ ...region, neighbors: remap(region.code, region.neighbors) }));
  for (const [code, config] of Object.entries(JOINED)) {
    const region = front.get(code);
    const outside = config.from.flatMap((member) => world.regions.find((one) => one.code === member).neighbors);
    const both = outside.includes("DE") ? ["DE", "DDDE"] : [];
    region.neighbors = [
      ...new Set([
        ...remap(
          code,
          outside.filter((one) => one !== "DE" && !config.from.includes(one)),
        ),
        ...both,
      ]),
    ]
      .filter((one) => one !== code)
      .sort();
  }
  const regions = [...kept, ...made];
  regions.sort(
    (a, b) => CONTINENTS.indexOf(a.group) - CONTINENTS.indexOf(b.group) || a.name.localeCompare(b.name, "en"),
  );
  return {
    ...world,
    id: "world-1990",
    name: "World in 1990",
    nameJa: "1990年の世界",
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, 1:110m, and admin-1 states and provinces, 1:10m, on the world's canvas as it was on 1 January 1990: the Soviet Union, Yugoslavia and Czechoslovakia joined along their borders, East and West Germany and the two Yemens from today's regions`,
    regions,
  };
}

/** `src/data/world-1990.data.ts`. */
export function writeWorld1990(world1990) {
  writeMap(
    join(out, "world-1990.data.ts"),
    `The world in 1990: ${world1990.regions.length} countries, ${world1990.source}.`,
    world1990,
    `/**
 * The world as it was on 1 January 1990, on the world's own canvas: the Soviet Union (\`SUHH\`), Yugoslavia (\`YUCS\`) and
 * Czechoslovakia (\`CSHH\`) as unions of today's countries, East Germany (\`DDDE\`) and West Germany (\`DE\`), South Yemen
 * (\`YDYE\`) and North Yemen (\`YE\`), and every other country as it is today.
 *
 * @example
 * \`\`\`ts
 * import WORLD_1990 from "@johnmorrisdotca/chizu/world-1990";
 *
 * const codes = WORLD_1990.regions.map((region) => region.code);
 * console.log(WORLD_1990.regions.length, codes.includes("SUHH"), codes.includes("RU"), codes.includes("DDDE"));
 * // ${world1990.regions.length} true false true
 * \`\`\`
 */
`,
  );
}

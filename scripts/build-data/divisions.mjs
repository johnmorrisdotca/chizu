import { geoAlbers, geoArea, geoAzimuthalEqualArea, geoCentroid, geoConicEqualArea, geoPath } from "d3-geo";
import { gapBetween, isoCodes, polygonsOf, regionFields, withRegionCodes } from "../build-data.mjs";
import { NATURAL_EARTH } from "../data-config.mjs";
import {
  COUNTRY_SIDE,
  EARTH_RADIUS_KM,
  keepDegrees,
  keepScale,
  keepTranslate,
  NEAR_DEGREES,
  neighboursBySharedPoints,
  regionOf,
  SMALL_KM2,
} from "./geometry.mjs";
import { geoSources, identityOf, insetProjections, namesOf, projections } from "./world.mjs";

// ---- Each country alone -----------------------------------------------------------------------------------------

export const DEGREES = 180 / Math.PI;

/**
 * The pieces of a country that are drawn on its own map: its largest piece, and every piece within `NEAR_DEGREES`
 * of it, or of a piece that is. France's Corsica comes, its Guiana, Réunion and Pacific islands do not (they are on
 * the world map). A country that is one piece or a handful close together is drawn whole.
 */
function corePieces(geometry) {
  const polygons = polygonsOf(geometry);
  const sizes = polygons.map((polygon) => geoArea({ type: "Polygon", coordinates: polygon }));
  const biggest = sizes.indexOf(Math.max(...sizes));
  const kept = new Set([biggest]);
  let grew = true;
  while (grew) {
    grew = false;
    for (let i = 0; i < polygons.length; i += 1) {
      if (kept.has(i)) continue;
      if ([...kept].some((k) => gapBetween(polygons[i], polygons[k]) <= NEAR_DEGREES)) {
        kept.add(i);
        grew = true;
      }
    }
  }
  return polygons.filter((_, i) => kept.has(i));
}

export function buildCountry(feature, near, fine) {
  const p = feature.properties;
  const code = p.__code;
  const area = geoArea(feature) * EARTH_RADIUS_KM ** 2;
  const finer = area < SMALL_KM2 ? fine.get(p.ADM0_A3) : undefined;
  const pieces = corePieces((finer ?? feature).geometry);
  const geometry = { type: "MultiPolygon", coordinates: pieces };
  const [lon, lat] = geoCentroid(geometry);
  const projection = geoAzimuthalEqualArea()
    .rotate([-lon, -lat])
    .fitExtent(
      [
        [0, 0],
        [COUNTRY_SIDE, COUNTRY_SIDE],
      ],
      geometry,
    );
  const draw = geoPath(projection);
  const [[x0, y0], [x1, y1]] = draw.bounds(geometry);
  const [tx, ty] = projection.translate();
  projection.translate([tx - x0, ty - y0]);
  const width = Math.round(x1 - x0);
  const height = Math.round(y1 - y0);
  const shown = { ...feature, geometry };
  const region = regionOf(geoPath(projection), shown, {
    code,
    ...namesOf(p, code),
    ...identityOf(p, code),
    path: "",
    neighbors: near,
  });
  const names = namesOf(p, code);
  projections.set(`country-${code.toLowerCase()}`, projection);
  return {
    id: `country-${code.toLowerCase()}`,
    kind: "country",
    name: names.name,
    ...(names.nameJa ? { nameJa: names.nameShortJa ?? names.nameJa } : {}),
    regionName: "Country",
    regionNamePlural: "Countries",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    wraps: false,
    projection: {
      kind: "azimuthal-equal-area",
      centre: [keepDegrees(lon), keepDegrees(lat)],
      scale: keepScale(projection.scale()),
      translate: projection.translate().map(keepTranslate),
    },
    insets: [],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, ${finer ? "1:10m" : "1:50m"}, Lambert azimuthal equal-area centred on the country, longer side ${COUNTRY_SIDE}`,
    regions: [region],
  };
}

function regionsOf(draw, features, config) {
  const near = neighboursBySharedPoints(features, (feature) => feature.properties.__code);
  const isos = isoCodes(config.code, features);
  const regions = features.map((feature, index) =>
    regionOf(draw, feature, {
      ...regionFields(config, feature, isos[index].iso, isos[index].shared),
      neighbors: near[index],
    }),
  );
  regions.sort((a, b) => a.code.localeCompare(b.code));
  return regions;
}

export function buildDivisions(config, rawFeatures, countryNames) {
  const features = withRegionCodes(config, rawFeatures);
  if (features.length === 0) throw new Error(`no regions for ${config.code}`);
  geoSources.set(`divisions-${config.code.toLowerCase()}`, features);
  const projection = config
    .projection()
    .fitSize([config.width, config.height], { type: "FeatureCollection", features });
  const regions = regionsOf(geoPath(projection), features, config);
  projections.set(`divisions-${config.code.toLowerCase()}`, projection);
  return {
    id: `divisions-${config.code.toLowerCase()}`,
    kind: "divisions",
    name: config.countryName,
    ...(countryNames.get(config.code)?.nameJa ? { nameJa: countryNames.get(config.code).nameJa } : {}),
    regionName: config.divisionTypeName,
    regionNamePlural: config.divisionTypePlural,
    viewBox: `0 0 ${config.width} ${config.height}`,
    width: config.width,
    height: config.height,
    wraps: false,
    projection: {
      kind: "other",
      description: `d3-geo ${config.projection
        .toString()
        .replace(/^\(\) => /, "")
        .replace(/\s+/g, " ")}, fitted to ${config.width}x${config.height}`,
    },
    insets: [],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m, fitted to ${config.width}x${config.height}`,
    regions,
  };
}

/**
 * The United States: the lower forty-eight and the District in an Albers equal-area conic, and Alaska and Hawaii each
 * in a conic of its own at the same scale, then drawn in boxes of their own under the lower forty-eight (the map's
 * `insets`), the way every published map of the country does it.
 */
export function buildUnitedStates(rawFeatures, countryNames) {
  const config = { code: "US", regionFn: (f) => f.properties.region || "United States" };
  const states = withRegionCodes(
    { filter: (f) => f.properties.iso_a2 === "US", codeFn: (f) => f.properties.postal },
    rawFeatures,
  );
  geoSources.set("divisions-us", states);
  const lower = states.filter((f) => f.properties.__code !== "AK" && f.properties.__code !== "HI");
  const width = 1000;
  const mainHeight = 600;
  const main = geoAlbers().fitExtent(
    [
      [0, 0],
      [width, mainHeight],
    ],
    { type: "FeatureCollection", features: lower },
  );
  const k = main.scale();
  const alaska = geoConicEqualArea().parallels([55, 65]).rotate([154, 0]).center([0, 62]).scale(k).translate([0, 0]);
  const hawaii = geoConicEqualArea().parallels([8, 18]).rotate([157, 0]).center([0, 20]).scale(k).translate([0, 0]);
  const near = neighboursBySharedPoints(states, (feature) => feature.properties.__code);
  const isos = isoCodes(config.code, states);
  const regions = states.map((feature, index) => {
    const p = feature.properties;
    const projection = p.__code === "AK" ? alaska : p.__code === "HI" ? hawaii : main;
    return regionOf(geoPath(projection), feature, {
      ...regionFields(config, feature, isos[index].iso, isos[index].shared),
      neighbors: near[index],
    });
  });
  regions.sort((a, b) => a.code.localeCompare(b.code));
  projections.set("divisions-us", main);
  insetProjections.set("divisions-us", { AK: alaska, HI: hawaii });
  const height = 740;
  return {
    id: "divisions-us",
    kind: "divisions",
    name: "United States",
    ...(countryNames.get("US")?.nameJa ? { nameJa: countryNames.get("US").nameJa } : {}),
    regionName: "State",
    regionNamePlural: "States",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    wraps: false,
    projection: {
      kind: "other",
      description: `d3-geo geoAlbers for the lower 48, a conic equal-area of its own for Alaska and for Hawaii, at one scale; fitted to ${width}x${mainHeight}`,
    },
    insets: [
      { code: "AK", box: { x: 20, y: 610, width: 360, height: 120 } },
      { code: "HI", box: { x: 400, y: 640, width: 230, height: 90 } },
    ],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m; Alaska and Hawaii drawn in boxes under the lower 48`,
    regions,
  };
}

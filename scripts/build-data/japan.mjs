import { groupings as kuniGroupings } from "@johnmorrisdotca/kuni/groupings";
import { subdivision as kuniSubdivision } from "@johnmorrisdotca/kuni/subdivisions";
import { geoMercator, geoPath } from "d3-geo";
import { isoCodes, polygonsOf } from "../build-data.mjs";
import { AMAMI, JAPAN_GROUPING, JAPAN_OUTLYING, NATURAL_EARTH } from "../data-config.mjs";
import { keepScale, keepTranslate, neighboursBySharedPoints, regionOf, round } from "./geometry.mjs";
import { geoSources, projections } from "./world.mjs";

/** Okinawa's pieces that are the Amami Islands, which Natural Earth draws inside Okinawa, moved to Kagoshima (see AMAMI in data-config.mjs). */
function withAmamiInKagoshima(features) {
  const isAmami = (polygon) => {
    const ring = polygon[0];
    return (
      Math.min(...ring.map(([lon]) => lon)) >= AMAMI.eastOf && Math.min(...ring.map(([, lat]) => lat)) >= AMAMI.northOf
    );
  };
  const okinawa = features.find((feature) => feature.properties.iso_3166_2 === "JP-47");
  const amami = polygonsOf(okinawa.geometry).filter(isAmami);
  if (amami.length === 0) throw new Error("no Amami Islands in Okinawa: has Natural Earth changed?");
  return features.map((feature) => {
    if (feature === okinawa)
      return {
        ...feature,
        geometry: {
          type: "MultiPolygon",
          coordinates: polygonsOf(feature.geometry).filter((polygon) => !isAmami(polygon)),
        },
      };
    if (feature.properties.iso_3166_2 === "JP-46")
      return {
        ...feature,
        geometry: { type: "MultiPolygon", coordinates: [...polygonsOf(feature.geometry), ...amami] },
      };
    return feature;
  });
}

/**
 * Japan's eight regions, from kuni's grouping (JAPAN_GROUPING in data-config.mjs): for each prefecture's ISO code, its
 * `group`, `groupJa` and `groupAliases`.
 */
function japanGroups() {
  const set = kuniGroupings({ kind: "subdivision" }).filter((one) => one.sets?.includes(JAPAN_GROUPING));
  if (set.length !== 8) throw new Error(`kuni's ${JAPAN_GROUPING} has ${set.length} regions, not 8`);
  const byIso = new Map();
  const bare = (name) => name.replace(/ region$/u, "").replace(/地方$/u, "");
  for (const region of set) {
    const others = (region.otherNames ?? []).flatMap((other) => [other.en, other.ja].filter(Boolean));
    const aliases = [...new Set([...others.flatMap((name) => [bare(name), name]), bare(region.name.ja)])];
    const fields = {
      group: bare(region.name.en),
      groupJa: region.name.ja,
      ...(others.length > 0 ? { groupAliases: aliases } : {}),
    };
    for (const iso of region.members) byIso.set(iso, fields);
  }
  return (iso) => {
    const fields = byIso.get(iso);
    if (!fields) throw new Error(`${iso} is in none of kuni's ${JAPAN_GROUPING}`);
    return fields;
  };
}

/** A prefecture's pieces whose northern edge is south of a latitude: the outlying islands that go in a box. */
const northernEdge = (polygon) => Math.max(...polygon[0].map(([, lat]) => lat));

/**
 * Japan's forty-seven prefectures. The mainland, from Rebun to Yakushima and down the Izu Islands to Torishima, in
 * Mercator fitted to a canvas 1000 across, the framing of the Japanese study app this package came from. Okinawa
 * is drawn in a box off the south-east, where the map is open Pacific; Kagoshima's islands south of Yakushima in a
 * box above it, which is north, as they lie; Tokyo's islands south of Torishima (Ogasawara, the Volcano Islands and
 * Minamitorishima) in a box east of Tohoku. Codes are the prefecture numbers, `"1"` to `"47"`, with `iso` the
 * ISO 3166-2 code (`JP-01`); the names and readings are kuni's.
 */
export function buildJapan(rawFeatures, countryNames) {
  const raw = rawFeatures.filter((feature) => feature.properties.iso_a2 === "JP");
  if (raw.length !== 47) throw new Error(`Japan: ${raw.length} prefectures in Natural Earth, not 47`);
  const features = withAmamiInKagoshima(raw).map((feature) => ({
    ...feature,
    properties: { ...feature.properties, __code: String(Number(feature.properties.iso_3166_2.slice(3))) },
  }));
  geoSources.set("divisions-jp", features);
  const mainland = features
    .filter((feature) => feature.properties.__code !== "47")
    .map((feature) => {
      const south =
        feature.properties.__code === "46"
          ? JAPAN_OUTLYING.kagoshimaSouthOf
          : feature.properties.__code === "13"
            ? JAPAN_OUTLYING.tokyoSouthOf
            : -90;
      return {
        ...feature,
        geometry: {
          type: "MultiPolygon",
          coordinates: polygonsOf(feature.geometry).filter((polygon) => northernEdge(polygon) >= south),
        },
      };
    });
  const width = 1000;
  const projection = geoMercator().fitWidth(width, { type: "FeatureCollection", features: mainland });
  const draw = geoPath(projection);
  const height = Math.ceil(draw.bounds({ type: "FeatureCollection", features: mainland })[1][1]);
  /* The line below which a prefecture's pieces are its outlying islands, on the canvas: a piece is outlying when its top is below it; and a rectangle of longitude and latitude on the canvas, for a box that takes the islands inside it. */
  const lineAt = (lon, lat) => round(projection([lon, lat])[1]);
  const near = neighboursBySharedPoints(features, (feature) => feature.properties.__code);
  const isos = isoCodes("JP", features);
  const japanGroup = japanGroups();
  const regions = features.map((feature, index) => {
    const p = feature.properties;
    const known = kuniSubdivision(isos[index].iso);
    if (!known?.name.ja || !known.reading) throw new Error(`Japan ${p.__code}: kuni has no Japanese name or reading`);
    return regionOf(draw, feature, {
      code: p.__code,
      iso: isos[index].iso,
      name: known.name.en,
      nameJa: known.name.ja,
      reading: known.reading,
      ...japanGroup(isos[index].iso),
      type: p.type_en.toLowerCase(),
      path: "",
      neighbors: near[index],
    });
  });
  regions.sort((a, b) => Number(a.code) - Number(b.code));
  projections.set("divisions-jp", projection);
  const [tx, ty] = projection.translate();
  return {
    id: "divisions-jp",
    kind: "divisions",
    name: "Japan",
    ...(countryNames.get("JP")?.nameJa ? { nameJa: countryNames.get("JP").nameJa } : {}),
    regionName: "Prefecture",
    regionNamePlural: "Prefectures",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    wraps: false,
    projection: {
      kind: "other",
      description: `d3-geo geoMercator, fitted to the mainland ${width} across (scale ${keepScale(projection.scale())}, translate ${keepTranslate(tx)},${keepTranslate(ty)})`,
    },
    insets: JAPAN_INSETS(lineAt, (lon0, lat0, lon1, lat1) => {
      const [x0, y1] = projection([lon0, lat0]).map(round);
      const [x1, y0] = projection([lon1, lat1]).map(round);
      return { x: x0, y: y0, width: round(x1 - x0), height: round(y1 - y0) };
    }),
    source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m, the Amami Islands given back to Kagoshima; Okinawa, Kagoshima's islands south of Yakushima and Tokyo's south of Torishima drawn in boxes, each holding its own part of the sea`,
    regions,
  };
}

/**
 * Where Japan's boxes sit. In the Sea of Japan, where a Japanese atlas puts them, each where it lies from the others:
 * Okinawa's main islands large in the middle, the Sakishima Islands south-west of them, Kagoshima's islands south of
 * Yakushima (the Tokara and Amami Islands) north-east, and the Daito Islands east; at the bottom right
 * Tokyo's Ogasawara Islands (Chichijima, Hahajima) large, and beside them Nishinoshima and the Volcano Islands, and
 * Minamitorishima, 1,800 km out. Each box holds
 * the islands of its own part of the sea (`within`, a rectangle of longitude and latitude on the canvas), magnified
 * to fill it, so Okinawa's main island is a shape and not a speck. Chosen against the data: a test checks that no
 * other region reaches into a box.
 */
function JAPAN_INSETS(lineAt, area) {
  return [
    {
      code: "13",
      box: { x: 790, y: 880, width: 40, height: 200 },
      within: area(141.9, 26.4, 142.5, 27.9),
      magnify: true,
    },
    {
      code: "13",
      box: { x: 840, y: 880, width: 40, height: 140 },
      within: area(140.6, 24, 141.7, 27.5),
      magnify: true,
    },
    {
      code: "13",
      box: { x: 840, y: 1035, width: 35, height: 35 },
      within: area(153.5, 24, 154.5, 24.7),
      magnify: true,
    },
    {
      code: "46",
      box: { x: 300, y: 160, width: 110, height: 230 },
      outlyingBelow: lineAt(130, JAPAN_OUTLYING.kagoshimaSouthOf),
      magnify: true,
    },
    {
      code: "47",
      box: { x: 200, y: 420, width: 230, height: 280 },
      within: area(126.5, 25.9, 128.6, 28.1),
      magnify: true,
    },
    {
      code: "47",
      box: { x: 20, y: 570, width: 170, height: 125 },
      within: area(122.5, 24, 125.7, 26.1),
      magnify: true,
    },
    {
      code: "47",
      box: { x: 440, y: 450, width: 40, height: 50 },
      within: area(130.9, 24.3, 131.6, 26.1),
      magnify: true,
    },
  ];
}

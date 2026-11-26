// The United States Minor Outlying Islands as nine regions in nine boxes (MODULES-1677). `countries/um` keeps only the
// pieces within 9 degrees of the largest (Palmyra, Kingman and Jarvis), the others being on the far side of the Pacific
// or in the Caribbean, so a projection cannot hold them on one canvas. Here each of the nine ISO 3166-2:UM places is a
// region of its own, fitted to a box of its own in a 3 by 3 grid, so every one is drawn.
import { subdivision } from "@johnmorrisdotca/kuni/subdivisions";
import { geoAzimuthalEqualArea, geoCentroid, geoPath } from "d3-geo";
import { NATURAL_EARTH } from "../data-config.mjs";
import { source } from "../natural-earth.mjs";
import { regionOf } from "./geometry.mjs";

const FILE = "ne_10m_admin_0_map_units.geojson";
const WIDTH = 1000;
const HEIGHT = 680;
const CELL = { width: 300, height: 200 };
const GAP = { x: 25, y: 20 };
/** The nine places in ISO order: Natural Earth's map unit (`GU_A3`), the ISO 3166-2 code's number, and the sea it is in. */
const PLACES = [
  { unit: "JQI", number: "67", group: "Pacific Ocean" },
  { unit: "MQI", number: "71", group: "Pacific Ocean" },
  { unit: "BQI", number: "76", group: "Caribbean Sea" },
  { unit: "WQI", number: "79", group: "Pacific Ocean" },
  { unit: "FQI", number: "81", group: "Pacific Ocean" },
  { unit: "HQI", number: "84", group: "Pacific Ocean" },
  { unit: "DQI", number: "86", group: "Pacific Ocean" },
  { unit: "KQI", number: "89", group: "Pacific Ocean" },
  { unit: "LQI", number: "95", group: "Pacific Ocean" },
];
const GROUPS_JA = { "Pacific Ocean": "太平洋", "Caribbean Sea": "カリブ海" };

/** The nine places, each its own region in its own box. */
export async function buildUmIslands(countryNames) {
  const units = (await source(FILE)).features.filter((feature) => feature.properties.ADM0_A3 === "UMI");
  const insets = [];
  const regions = PLACES.map((place, index) => {
    const feature = units.find((one) => one.properties.GU_A3 === place.unit);
    if (!feature) throw new Error(`${FILE} has no map unit ${place.unit}`);
    const iso = `UM-${place.number}`;
    const known = subdivision(iso);
    if (!known) throw new Error(`kuni has no ${iso}`);
    const box = {
      x: GAP.x + (index % 3) * (CELL.width + GAP.x),
      y: GAP.y + Math.floor(index / 3) * (CELL.height + GAP.y),
      width: CELL.width,
      height: CELL.height,
    };
    const [lon, lat] = geoCentroid(feature);
    const projection = geoAzimuthalEqualArea()
      .rotate([-lon, -lat])
      .fitExtent(
        [
          [box.x + 10, box.y + 10],
          [box.x + box.width - 10, box.y + box.height - 10],
        ],
        feature,
      );
    insets.push({ code: place.number, box });
    return regionOf(geoPath(projection), feature, {
      code: place.number,
      iso,
      name: known.name.en,
      ...(known.name.ja ? { nameJa: known.name.ja } : {}),
      group: place.group,
      groupJa: GROUPS_JA[place.group],
      type: "territory",
      path: "",
      neighbors: [],
    });
  });
  const parent = countryNames.get("UM");
  return {
    id: "divisions-um-islands",
    kind: "divisions",
    name: "U.S. Minor Outlying Islands",
    ...(parent?.nameJa ? { nameJa: parent.nameJa } : {}),
    regionName: "Island or atoll",
    regionNamePlural: "Islands and atolls",
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    width: WIDTH,
    height: HEIGHT,
    wraps: false,
    projection: {
      kind: "other",
      description:
        "a Lambert azimuthal equal-area of its own for each place, centred on it and fitted to its own box in a 3 by 3 grid, so no two places are at one scale",
    },
    insets,
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 map units, 1:10m; each of the nine places of ISO 3166-2:UM drawn in a box of its own`,
    regions,
  };
}

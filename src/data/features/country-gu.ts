/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Guam (country-gu): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-gu","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gu; names from Natural Earth and Wikidata","features":[{"code":"Q159183","kind":"sea","group":"marine","name":"Philippine Sea","nameJa":"フィリピン海","reading":"ふぃりぴんかい","rank":1,"path":"M-1,-1L773,-1L773,1001L-1,1001ZM500.4,76.8L390.9,308.7L59.3,545.6L60.5,824.9L90.4,878.7L177.7,959.4L277.4,955.6L367.2,588L745.7,202.2L672.1,133.1L591.1,96.1Z","bbox":[-1,-1,773,1001],"centroid":[549.3,779],"neighbors":[]},{"code":"Q4380977","kind":"peak","group":"peaks","name":"Mount Lamlam","nameJa":"ラムラム山","reading":"らむらむさん","rank":9,"elevation":406,"path":"","bbox":[139.2,733.2,139.2,733.2],"centroid":[139.2,733.2],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Luxembourg (country-lu): 0 seas, 0 lakes, 1 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-lu","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-lu; names from Natural Earth and Wikidata","features":[{"code":"ne-river-534","kind":"river","group":"rivers","name":"Mosel","rank":7,"path":"M534.8,1001L538.7,989.2L547.3,985.1L556.4,984.9L555.8,980.5L555.8,970.5L552.9,929.2L560.2,872L560.1,828.9L565,813.8L578.3,792.8L601.2,764.3L610,745.8L616.7,735.9L619,729.7L618.1,720.7L612.7,715.5L607.1,711.6L605.5,707.1L619.1,687.8L683.7,645.4L693,635.9","bbox":[534.8,635.9,693,1001],"centroid":[575.5,797.2],"angle":-61,"neighbors":[]},{"code":"capital-LU","kind":"capital","group":"capitals","name":"Luxembourg","nameJa":"ルクセンブルク市","reading":"るくせんぶるくし","rank":0,"path":"","bbox":[364.9,770.1,364.9,770.1],"centroid":[364.9,770.1],"neighbors":[]}]};

export default layer;

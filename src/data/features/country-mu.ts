/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Mauritius (country-mu): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mu","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mu; names from Natural Earth and Wikidata","features":[{"code":"Q1239","kind":"ocean","group":"marine","name":"Indian Ocean","nameJa":"インド洋","reading":"いんどよう","rank":0,"path":"M-1,-1L1001,-1L1001,131L-1,131ZM12.9,128.1L35.6,129.7L56,124.8L64.9,116.2L67.8,104.8L76.8,97.6L78.6,78L69.7,58.4L56.7,39.8L43.7,41.1L33.9,51.2L29.4,66.3L18,73.2L13.1,80.8L9.4,99.6L9.9,111.4L2.3,115.1L4,118.9Z","bbox":[-1,-1,1001,131],"centroid":[500,65],"neighbors":[]},{"code":"Q1760978","kind":"peak","group":"peaks","name":"Piton de la Petite Rivière Noire","nameJa":"ラ・プティ・リヴィエール・ノワール山","reading":"らぷてぃりゔぃえーるのわーるさん","rank":9,"elevation":828,"path":"","bbox":[27.8,110.9,27.8,110.9],"centroid":[27.8,110.9],"neighbors":[]}]};

export default layer;

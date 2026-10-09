/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Antigua & Barbuda (country-ag): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ag","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ag; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L820,-1L820,1001L-1,1001Z","bbox":[-1,-1,820,1001],"centroid":[409.5,500],"neighbors":[]},{"code":"Q1718336","kind":"peak","group":"peaks","name":"Mount Obama","nameJa":"オバマ山","reading":"おばまさん","rank":9,"elevation":402,"path":"","bbox":[615.6,860.8,615.6,860.8],"centroid":[615.6,860.8],"neighbors":[]},{"code":"capital-AG","kind":"capital","group":"capitals","name":"Saint John's","nameJa":"セントジョンズ","reading":"セントジョンズ","rank":0,"path":"","bbox":[611.7,764.4,611.7,764.4],"centroid":[611.7,764.4],"neighbors":[]}]};

export default layer;

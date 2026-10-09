/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of French Polynesia (country-pf): 1 seas, 0 lakes, 0 rivers, 0 landforms, 2 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-pf","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-pf; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L940,-1L940,1001L-1,1001ZM241.8,490.3L242,493L244.8,498.9L249.5,499.7L256.3,498.5L258.8,503.1L260.6,504.4L264.2,505L265.6,502.4L264.2,498.6L257.2,496.4L256.7,491.2L254.2,487.9L247.9,486.7L243,488.6Z","bbox":[-1,-1,940,1001],"centroid":[587.1,351.9],"neighbors":[]},{"code":"ne-1159108017","kind":"peak","group":"peaks","name":"Mont Ooumu","nameJa":"モン・ウム山","reading":"もんうむさん","rank":9,"elevation":1185,"path":"","bbox":[712.8,46.3,712.8,46.3],"centroid":[712.8,46.3],"neighbors":[]},{"code":"Q512465","kind":"peak","group":"peaks","name":"Mont Orohena","nameJa":"オロヘナ山","reading":"おろへなさん","rank":9,"elevation":2241,"path":"","bbox":[249.2,492.8,249.2,492.8],"centroid":[249.2,492.8],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Åland Islands (country-ax): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ax","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ax; names from Natural Earth and Wikidata","features":[{"code":"Q122574","kind":"gulf","group":"marine","name":"Gulf of Bothnia","nameJa":"ボスニア湾","reading":"ぼすにあわん","rank":3,"path":"M-1,-1L1001,-1L1001,739L-1,739ZM330.6,500L329.7,424.3L336,388.5L355.5,372.3L388.8,362.8L407.6,373.5L432.8,371.5L473.2,285.5L461.1,257.2L425.8,243.7L415.4,217.4L364.5,167.4L330.7,160L322,170.8L302.7,170.8L274.3,162.7L239,100.4L197.9,120.6L175.3,166.4L190.6,195.6L217.3,211.9L227.9,233.5L225.1,276.8L212.5,336.9L172.9,346.2L169.2,254.3L142.4,258.2L110.8,276.3L101.5,320.9L147.3,492.1L181.6,514.6Z","bbox":[-1,-1,1001,739],"centroid":[714.4,451.4],"neighbors":[]}]};

export default layer;

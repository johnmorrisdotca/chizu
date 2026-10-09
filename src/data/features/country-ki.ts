/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Kiribati (country-ki): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 0 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ki","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ki; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M186.4,173L183.8,178L179.3,175.6L177.8,173.1L174.9,174.6L184.7,181.7L195.5,185.2L199.9,184.6L189.5,177.5L190.8,170.5L183.4,167L180.3,166.7L188.1,171.9ZM530,270.3L-1,271.7L-1,-1L530,-1ZM-1,271.7L530,270.3L530,1001L-1,1001Z","bbox":[-1,-1,530,1001],"centroid":[263.5,537.3],"neighbors":[]}]};

export default layer;

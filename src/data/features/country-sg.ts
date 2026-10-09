/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Singapore (country-sg): 1 seas, 0 lakes, 0 rivers, 1 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-sg","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-sg; names from Natural Earth and Wikidata","features":[{"code":"Q205655","kind":"strait","group":"marine","name":"Singapore Strait","nameJa":"シンガポール海峡","reading":"しんがぽーるかいきょう","rank":4,"path":"M739.6,89.7L488.9,3.6L178.5,69.2L26.9,339L494.7,505.1L907.3,322.9L980.1,229.6L882.5,155.2ZM-1,118.4L147.7,-1L736.8,-1L757.1,5.1L815.4,-1L1001,-1L1001,509L-1,509Z","bbox":[-1,-1,1001,509],"centroid":[909.4,419.4],"neighbors":[]},{"code":"Q18758","kind":"peninsula","group":"landforms","name":"Malay Peninsula","nameJa":"マレー半島","reading":"まれーはんとう","rank":2,"path":"M816.9,-1L756.8,5.4L735.8,-1ZM146.9,-1L-1,118.4L-1,-1ZM27,339.2L178.7,69.4L489.1,4.3L739.8,90L882.7,155.4L980.6,229.8L907.2,322.9L494.5,504.9Z","bbox":[-1,-1,980.6,504.9],"centroid":[479.2,250],"neighbors":[]},{"code":"ne-1159105879","kind":"peak","group":"peaks","name":"Bukit Timah","nameJa":"ブキット・ティマ丘陵","rank":9,"elevation":176,"path":"","bbox":[412,271.8,412,271.8],"centroid":[412,271.8],"neighbors":[]},{"code":"capital-SG","kind":"capital","group":"capitals","name":"Singapore","nameJa":"シンガポール","reading":"シンガポール","rank":0,"path":"","bbox":[439.7,409.5,439.7,409.5],"centroid":[439.7,409.5],"neighbors":[]}]};

export default layer;

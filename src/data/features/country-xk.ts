/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Kosovo (country-xk): 0 seas, 0 lakes, 1 rivers, 1 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-xk","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-xk; names from Natural Earth and Wikidata","features":[{"code":"Q189915","kind":"range","group":"landforms","name":"Dinaric Alps","nameJa":"ディナル・アルプス山脈","reading":"でぃなるあるぷすさんみゃく","rank":4,"path":"M825.7,-1L828.1,10.8L835.9,121.8L819.9,217.2L790.8,269.6L749.1,321.4L620.8,455.5L595.1,473.7L571.4,478.2L529.2,453.9L448.5,372.7L401.2,348.6L326.7,349.3L266.6,378.9L-1,639.6L-1,-1Z","bbox":[-1,-1,835.9,639.6],"centroid":[572,206.7],"neighbors":[]},{"code":"Q179251","kind":"river","group":"rivers","name":"Morava","nameJa":"モラヴァ川","reading":"もらゔぁがわ","rank":7,"path":"M685.9,719.1L687.3,701.5L692.1,681.1L696.4,638.5L691.8,627.2L695.9,620.4L732.4,606.9L740.4,601.1L748,592.5L762.4,579.4L816.9,560.7L808.3,541.9L816.6,526.3L833.9,518.2L852.1,521.8L861.1,532.6L862.9,533.3L864.2,534.4L869.7,547.7L870.4,550.5L878,554.2L887.6,555.1L897.5,553.5L906.3,550.2L907,550.3","bbox":[685.9,518.2,907,719.1],"centroid":[774.5,575.3],"angle":-27,"neighbors":[]},{"code":"Q341983","kind":"peak","group":"peaks","name":"Đeravica","nameJa":"ジェラヴィツァ","reading":"ジェラヴィツァ","rank":9,"elevation":2656,"path":"","bbox":[58.5,515,58.5,515],"centroid":[58.5,515],"neighbors":[]}]};

export default layer;

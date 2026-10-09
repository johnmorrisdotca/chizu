/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Cyprus (country-cy): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-cy","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-cy; names from Natural Earth and Wikidata","features":[{"code":"Q4918","kind":"sea","group":"marine","name":"Mediterranean Sea","nameJa":"地中海","reading":"ちちゅうかい","rank":1,"path":"M411.7,377L411.9,368.1L432.6,342.6L461.6,328.8L495.1,326.9L561,313.7L626,291.2L680.4,253.8L781.2,143.9L813.7,141.6L848.5,146.2L911,141.8L972.9,129.9L958,91.8L907,29.1L897.5,-1L1001,-1L1001,377ZM334.8,-1L332.6,4.6L273.9,18.6L208.4,2.9L155.7,20.7L111.3,64.3L65.1,91L16,68.7L24.4,155.4L76.5,272.7L95.8,305.4L126.8,320.7L229.6,359.3L261,360.5L325.3,351.8L351.1,368.7L354.3,377L-1,377L-1,-1Z","bbox":[-1,-1,1001,377],"centroid":[883.5,260.4],"neighbors":[]},{"code":"Q819979","kind":"peak","group":"peaks","name":"Mount Olympus","nameJa":"オリンポス山","reading":"おりんぽすさん","rank":7,"elevation":1951,"path":"","bbox":[329.6,148.1,329.6,148.1],"centroid":[329.6,148.1],"neighbors":[]}]};

export default layer;

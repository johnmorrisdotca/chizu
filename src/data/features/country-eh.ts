/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Western Sahara (country-eh): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-eh","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-eh; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M486.1,-1L479.5,5.2L470.1,33.7L452.1,70.8L441.9,106.1L432.5,123.8L418.5,135.5L388.6,155.2L363.5,164.3L346.6,179.4L334.7,184.8L327.9,196.4L321.3,227.1L311.9,241.9L299.1,275.4L288.5,293.8L282.4,317.5L280,362.5L274,382.1L257.8,403.9L240,412.5L191.9,463.9L169,478.9L154.3,492.6L147.6,505.8L144.1,514.8L152.3,507.7L159.3,498.4L165.8,493.1L167.1,499.5L165,505.1L148.2,530.1L141.4,546.4L126.8,571.7L114.9,588L119.5,596.7L115.3,607.8L102.7,621.8L95.4,652.6L75.9,685.8L55.4,692.9L41.9,707.2L24.4,740.3L12.9,807.5L0,874.5L5.9,881.2L12.9,851.2L16.3,846.6L21.6,841.8L27.8,845.7L44.3,882L-1,882L-1,-1Z","bbox":[-1,-1,486.1,882],"centroid":[164.5,164.5],"neighbors":[]},{"code":"capital-EH","kind":"capital","group":"capitals","name":"El Aaiún","nameJa":"アイウン","reading":"アイウン","rank":0,"path":"","bbox":[476.2,70.5,476.2,70.5],"centroid":[476.2,70.5],"neighbors":[]}]};

export default layer;

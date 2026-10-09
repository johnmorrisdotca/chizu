/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of North Macedonia (country-mk): 0 seas, 0 lakes, 1 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mk","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mk; names from Natural Earth and Wikidata","features":[{"code":"Q213975","kind":"river","group":"rivers","name":"Drin","nameJa":"ドリン川","reading":"どりんがわ","rank":9,"path":"M90.5,619L90.2,609.9L86.1,596.7L85.2,588.3L83.5,582.7L68.1,563.5L66.8,560L68.5,556.2L72.8,549.5L74.6,545.5L64.7,522.5L60.7,518.6L55.4,511.8L45.3,482.3L35,473.9L30.4,464.1L27.8,460.3L25.9,456.5L22.7,454L19.5,452.6L12.5,451.7L9.3,449.9L7.9,447.6L6.1,441.8L4.1,439.1L4.1,435.2L8.8,429.2L6.5,420.6L1.8,410.9L-0.7,401.5L0,393.1L-1,391.6","bbox":[-1,391.6,90.5,619],"centroid":[51.5,500.3],"angle":61,"neighbors":[]}]};

export default layer;

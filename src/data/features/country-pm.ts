/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of St. Pierre & Miquelon (country-pm): 2 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-pm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-pm; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M-1,944.4L43.7,934.1L165.9,823.8L74.5,890.6L20.5,827.9L33.6,755.6L112.9,580L110.1,529.5L17.4,188.9L33.2,133.1L56.4,108.6L191.9,180.9L207.7,273.5L143.6,481.9L187.3,620.9L247.9,721.6L233,762.5L287.9,713.4L444,647.7L444,1001L-1,1001Z","bbox":[-1,108.6,444,1001],"centroid":[311,869.1],"neighbors":["Q169523"]},{"code":"Q169523","kind":"gulf","group":"marine","name":"Gulf of Saint Lawrence","nameJa":"セントローレンス湾","reading":"せんとろーれんすわん","rank":4,"path":"M444,647.7L287.9,713.4L233,762.5L247.9,721.6L187.3,620.9L143.6,481.9L207.7,273.5L191.9,180.9L56.4,108.6L33.2,133.1L17.4,188.9L110.1,529.5L112.9,580L33.6,755.6L20.5,827.9L74.5,890.6L165.9,823.8L43.7,934.1L-1,944.4L-1,-1L444,-1Z","bbox":[-1,-1,444,944.4],"centroid":[298,478.8],"neighbors":["Q97"]},{"code":"Q3051597","kind":"peak","group":"peaks","name":"Morne de la Grande Montagne","nameJa":"モルヌ・デ・ラ・グランデ・モンターニュ","reading":"モルヌデラグランデモンターニュ","rank":9,"elevation":240,"path":"","bbox":[152.1,260.8,152.1,260.8],"centroid":[152.1,260.8],"neighbors":[]},{"code":"capital-PM","kind":"capital","group":"capitals","name":"Saint-Pierre","nameJa":"サン＝ピエール","reading":"サンピエール","rank":0,"path":"","bbox":[381.2,929.8,381.2,929.8],"centroid":[381.2,929.8],"neighbors":[]}]};

export default layer;

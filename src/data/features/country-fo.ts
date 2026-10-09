/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Faroe Islands (country-fo): 2 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-fo","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-fo; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M-1,166.3L113.3,289L103.5,256.8L143.3,258.7L190.6,246.4L212.9,258.1L254.6,297.2L269.3,324.1L245.3,350.3L215.9,357.1L180.9,351.1L160.7,341L466.7,702.6L636,775.8L636,1001L-1,1001Z","bbox":[-1,166.3,636,1001],"centroid":[227.9,773.4],"neighbors":["Q47545"]},{"code":"Q47545","kind":"sea","group":"marine","name":"Norwegian Sea","nameJa":"ノルウェー海","reading":"のるうぇーかい","rank":2,"path":"M390.9,132.6L319.5,82.6L220.5,112.8L293.5,303.6L388.5,419.5L428.2,445.3L433.1,432.6L429.3,406.8L388.4,317.4L375.4,302.1L374.1,278.4L382,259L407.3,266.3L441.2,303.1L460.1,304.1L471.2,170.3ZM636,775.8L466.7,702.6L160.7,341L180.9,351.1L215.9,357.1L245.3,350.3L269.3,324.1L254.6,297.2L212.9,258.1L190.6,246.4L143.3,258.7L103.5,256.8L113.3,289L-1,166.3L-1,-1L636,-1Z","bbox":[-1,-1,636,775.8],"centroid":[505.4,547.7],"neighbors":["Q97"]},{"code":"Q738746","kind":"peak","group":"peaks","name":"Slættaratindur","nameJa":"スラッタラティンドル山","reading":"すらったらてぃんどるさん","rank":9,"elevation":882,"path":"","bbox":[302.8,98.4,302.8,98.4],"centroid":[302.8,98.4],"neighbors":[]},{"code":"capital-FO","kind":"capital","group":"capitals","name":"Tórshavn","nameJa":"トースハウン","reading":"トースハウン","rank":0,"path":"","bbox":[407,387.3,407,387.3],"centroid":[407,387.3],"neighbors":[]}]};

export default layer;

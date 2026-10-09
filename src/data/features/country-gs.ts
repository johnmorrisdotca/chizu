/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of South Georgia & South Sandwich Islands (country-gs): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-gs","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gs; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M-1,-1L1001,-1L1001,910L-1,910ZM185.4,139L198.7,133.9L205.2,127.3L211.4,122.7L201,114.5L200.3,102.9L202.7,89.9L196.4,92L190.1,91.9L186.5,89.7L182.4,74.6L177.3,62.7L171.5,59.3L166.9,48L163.1,42.1L157.7,46.5L155.8,50.4L151.9,51.1L143.4,41.7L133.6,44L137.2,32.6L128.2,19.8L123,19.8L118.8,18.8L114.7,16.3L107.3,15.8L100.3,21.1L91.2,13.5L79.2,13L66.5,5.1L65.2,1.1L51,3L13.1,4.2L6.5,6.3L16.3,9.4L43.5,10.8L37.1,16.3L37,25.5L42.8,30.5L55,28.4L86.7,46L93.7,52.3L100.7,56.8L111.8,56.4L115,60.6L117.6,66.5L125.8,76.3L135.7,80.8L146.8,83.1L150,86.7L152.4,92.5L164.8,111.8L170.3,125.3L181.9,136.8Z","bbox":[-1,-1,1001,910],"centroid":[527.5,452.7],"neighbors":[]},{"code":"Q1573762","kind":"peak","group":"peaks","name":"Mount Paget","nameJa":"パジット山","reading":"ぱじっとさん","rank":6,"elevation":2915,"path":"","bbox":[142.7,69.2,142.7,69.2],"centroid":[142.7,69.2],"neighbors":[]},{"code":"capital-GS","kind":"capital","group":"capitals","name":"King Edward Point","nameJa":"キング・エドワード・ポイント","reading":"キングエドワードポイント","rank":0,"path":"","bbox":[148.1,46.7,148.1,46.7],"centroid":[148.1,46.7],"neighbors":[]}]};

export default layer;

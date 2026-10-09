# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing exported has been removed or renamed, and no type has lost a field. Names have changed, because they now come from kuni 国: every change is listed below.

### Added

- **Japan's 47 prefectures**, `@johnmorrisdotca/chizu/divisions/jp` and `loadDivisions("jp")`, from Natural Earth's admin-1 file at 1:10m (186 kB built, between Germany's 203 kB and South Korea's 66 kB). Codes are the prefecture numbers, `"1"` (Hokkaidō) to `"47"` (Okinawa); names in English and Japanese and readings in kana (東京都, とうきょうと) are kuni's; `group` is the region a Japanese school teaches (Hokkaido, Tohoku, Kanto, Chubu, Kinki, Chugoku, Shikoku, Kyushu); `type` is `prefecture`, `metropolis`, `urban prefecture` or `circuit`. The mainland is drawn in Mercator 1,000 across; Okinawa is in a box in the Sea of Japan at nearly its own scale, Kagoshima's islands south of Yakushima (the Tokara and Amami Islands) in a box beside it, and Tokyo's islands south of Torishima (Ogasawara, the Volcano Islands, Minamitorishima) in a box at the bottom right. Natural Earth draws the Amami Islands inside Okinawa; the build gives them back to Kagoshima.
- **`iso` on every region of a country**: its ISO 3166-2 code in full (`JP-13`, `CA-ON`, `US-TX`), from kuni at build time, on 1,320 of the 1,342 regions. Where Natural Earth's code is out of date the build uses the current one (`FR-75C` for Paris, `PL-24` for Silesia, `MX-CMX`, `TW-NWT`); where Natural Earth draws one ISO subdivision as several regions, each carries the code of the one it lies in (County Dublin's four councils are `IE-D`). The 22 regions with no code are listed with the reason in `docs/iso-codes.md` in the repository; a test holds every region to a code or a reason. `code` is unchanged.
- `CHIZU_SOURCE.names`: kuni's package name, version and licence, beside Natural Earth's.
- **Continents and other groups.** `CHIZU_CONTINENTS` and `CHIZU_SUBREGIONS` in `/names`: kuni's seven continents (UN M49 by way of CLDR, the Americas as two) and the twenty-two UN M49 subregions, each with its English and Japanese names, reading and countries; every country is in exactly one continent. In the engine, `regionGroups(map)` lists a map's own groups (the continents on the world, Japan's eight regions, Canada's five, the Census regions of the United States); `groupMap(map, codes)` cuts a map down to a group, so a quiz or a callout sheet stays within it; `groupBox(map, codes, aspect)` frames a group, each member on its mainland; `groupTones(map, codes)` fades the rest. Any list of codes is a group, so a grouping kuni does not yet keep (the EU, the G7) is passed in. The type `ChizuGroup`.
- `groupJa` on a region: its group in Japanese (アジア, 関東地方, 南部).
- **`loadWorldDetail()`** in `/load`: the world drawn finer, the same 173 countries on the same canvas and in the same projection, from Natural Earth's 1:50m outlines (1.3 MB, fetched only when asked for). `mountChizu` takes it as `detail` (a map, or a function that loads one) and draws it from `detailFrom` in (default 4×), so the coasts stay smooth at the deeper zoom steps; framing, choosing and callouts keep to the world itself. A detail is drawn only when its `id` is the map's with `-detail` after it.
- **The demo** opens on Japan's prefectures, and adds: a part of the map to look at (a continent or UN subregion of the world, one of a country's regions such as Japan's Kanto); four kinds of quiz question (pick the name, type the name in English or Japanese, type the reading in kana, find the place on the map), in rounds of ten made from a seed, so a shared link asks the same ten, with a streak and a best streak; the round's results, the list of places, the numbered list of callouts and the coloured figures to download as CSV, JSON or text, and the map and a printable callout sheet as SVG or PNG; a Colour mode that shades the map from pasted figures in five steps, or by part; and the code for the map as it is, to copy. All of it runs in the browser.
- **An `@example` on every export of every entry point**, shown on the API reference page. `pnpm test:readme` type-checks and runs each one and compares what it prints with the comment that ends it; `pnpm check` fails on an export without one.

### Changed

- **The countries' names, short names, readings, continents and three-letter codes are kuni's** (`@johnmorrisdotca/kuni` 1.0.0, whose names are Unicode CLDR's and Wikidata's), read by `scripts/build-data.mjs` at build time, so Chizu and kuni never name a country two ways. kuni is a development dependency of the build script only: the package imports nothing at run time and still depends on nothing. NOTICE.md carries the Unicode licence. The three places Natural Earth draws that have no ISO code (Ashmore and Cartier Islands, the Indian Ocean Territories, the Siachen Glacier) keep Natural Earth's names, and now have readings.
- `nameShortJa` is now only kuni's everyday short name where it differs from the name: 中国, 韓国, 北朝鮮, 台湾, タイ, モンゴル and 南アフリカ are now the `nameJa` itself, so `nameShortJa` is gone from them and what `nameOf(…, "ja")` shows is unchanged. The United Kingdom keeps イギリス, not CLDR's written abbreviation 英国.
- Continents are kuni's (UN M49 by way of CLDR): Russia is in Asia, Cyprus in Europe and Timor-Leste in Oceania, and the islands Natural Earth put in "Seven seas (open ocean)" are in Africa, Asia or Antarctica.
- **A region that is exactly one ISO subdivision takes kuni's names**, except where kuni 1.0.0's are wrong or read worse on a map, where Natural Earth's are kept (listed in `scripts/data-config.mjs` with the reason). This corrects regions Natural Earth had misnamed: on the United Kingdom's map Wirral was a second "Halton" and St Helens was "Merseyside"; on Italy's, Genoa was "Liguria" and South Tyrol "Trentino-South Tyrol"; on Vietnam's, three provinces carried the names of larger regions; on Russia's, Altai Krai was a second "Altai Republic".
- **No two regions of one map share a name**, in English or in Japanese (a test holds it): Cork City, Galway City, Limerick City and Waterford City beside their counties, North and South Tipperary, Chiayi City and County, Hsinchu County, Buenos Aires Province, the Lima Region, Moscow Province, Washington DC.
- **Zoom goes to 10×**: `MAP_ZOOM_LEVELS` is `[1, 2, …, 10]`, whole steps, and `MapZoom` is 1 to 10. `zoomToFit` and `focusRegionFit` fit a small place closer (Luxembourg and Qatar on the world, a city prefecture or a ward now at 10×). The first step is still 1× and the last the deepest, so code that reads `MAP_ZOOM_LEVELS[0]` and the last element for its buttons follows the new ladder; code that listed the five values by hand, or switched over every `MapZoom`, should read the array instead. The lines of the drawing keep their width on the screen at every step (`vector-effect: non-scaling-stroke`), and labels and callouts are sized from the window, so neither grows with the zoom.
- Canada's regions are grouped in its five regions (Atlantic, Central, Prairies, West Coast, North) in place of Natural Earth's three (Eastern, Western and Northern Canada), with their Japanese names.
- Framing a region whose outlying islands are drawn in a box (`regionBox`, `regionCentre`, `zoomToFit`) frames the part left in place, not the box: Tokyo is framed on Tokyo and the Izu Islands, not on Ogasawara's box. No map had such a region before Japan.

#### Every name that changed

- **Countries** (`CHIZU_COUNTRIES`, the world and each country alone, which agree): 69 countries.

  - `AG` English Antigua and Barb. → Antigua & Barbuda
  - `AS` Japanese アメリカ領サモア → 米領サモア; reading none → べいりょうさもあ
  - `ATC` reading none → あしゅもあかるてぃえしょとう
  - `AX` English Åland → Åland Islands; reading none → おーらんどしょとう
  - `BA` English Bosnia and Herz. → Bosnia & Herzegovina
  - `BL` English St-Barthélemy → St. Barthélemy; Japanese サン・バルテルミー島 → サン・バルテルミー; reading none → サンバルテルミー
  - `BM` Japanese バミューダ諸島 → バミューダ; reading none → バミューダ
  - `CD` English Dem. Rep. Congo → Congo - Kinshasa; Japanese コンゴ民主共和国 → コンゴ民主共和国(キンシャサ); reading こんごみんしゅきょうわこく → こんごみんしゅきょうわこくきんしゃさ
  - `CF` English Central African Rep. → Central African Republic
  - `CG` English Congo → Congo - Brazzaville; Japanese コンゴ共和国 → コンゴ共和国(ブラザビル); reading こんごきょうわこく → こんごきょうわこくぶらざびる
  - `CI` English Côte d'Ivoire → Côte d’Ivoire
  - `CK` English Cook Is. → Cook Islands; reading none → くっくしょとう
  - `CN` Japanese 中華人民共和国 → 中国; short Japanese 中国 → none
  - `CV` English Cabo Verde → Cape Verde
  - `CY` continent Asia → Europe
  - `DM` reading none → どみにかこく
  - `DO` English Dominican Rep. → Dominican Republic
  - `EH` English W. Sahara → Western Sahara
  - `FK` English Falkland Is. → Falkland Islands
  - `FM` reading none → みくろねしあれんぽう
  - `FO` English Faeroe Is. → Faroe Islands; reading none → ふぇろーしょとう
  - `GQ` English Eq. Guinea → Equatorial Guinea
  - `GS` English S. Geo. and the Is. → South Georgia & South Sandwich Islands; reading none → さうすじょーじあさうすさんどうぃっちしょとう; continent Seven seas (open ocean) → Antarctica
  - `HK` English Hong Kong → Hong Kong SAR China; Japanese 香港 → 中華人民共和国香港特別行政区; short Japanese none → 香港; reading none → ほんこん
  - `HM` English Heard I. and McDonald Is. → Heard & McDonald Islands; Japanese ハード島とマクドナルド諸島 → ハード島・マクドナルド諸島; reading none → はーどとうまくどなるどしょとう; continent Seven seas (open ocean) → Antarctica
  - `IM` reading none → まんとう
  - `IO` English Br. Indian Ocean Ter. → British Indian Ocean Territory; Japanese イギリス領インド洋地域 → 英領インド洋地域; reading none → えいりょういんどようちいき; continent Seven seas (open ocean) → Asia
  - `IOA` reading none → おーすとらりありょういんどようちいき
  - `KAS` reading none → しあちぇんひょうが
  - `KN` English St. Kitts and Nevis → St. Kitts & Nevis; Japanese セントクリストファー・ネイビス → セントクリストファー・ネーヴィス; reading セントクリストファーネイビス → セントクリストファーネーヴィス
  - `KP` Japanese 朝鮮民主主義人民共和国 → 北朝鮮; short Japanese 北朝鮮 → none
  - `KR` Japanese 大韓民国 → 韓国; short Japanese 韓国 → none
  - `KY` English Cayman Is. → Cayman Islands; reading none → けいまんしょとう
  - `LC` English Saint Lucia → St. Lucia
  - `MF` English St-Martin → St. Martin
  - `MH` English Marshall Is. → Marshall Islands; reading none → まーしゃるしょとう
  - `ML` Japanese マリ共和国 → マリ; reading まりきょうわこく → マリ
  - `MM` English Myanmar → Myanmar (Burma); Japanese ミャンマー → ミャンマー (ビルマ)
  - `MN` Japanese モンゴル国 → モンゴル; short Japanese モンゴル → none
  - `MO` English Macao → Macao SAR China; Japanese マカオ → 中華人民共和国マカオ特別行政区; short Japanese none → マカオ
  - `MP` English N. Mariana Is. → Northern Mariana Islands; reading none → きたまりあなしょとう
  - `MU` continent Seven seas (open ocean) → Africa
  - `MV` continent Seven seas (open ocean) → Asia
  - `NF` reading none → のーふぉーくとう
  - `PF` English Fr. Polynesia → French Polynesia; Japanese フランス領ポリネシア → 仏領ポリネシア; reading none → ふつりょうぽりねしあ
  - `PM` English St. Pierre and Miquelon → St. Pierre & Miquelon; reading none → さんぴえーるとうみくろんとう
  - `PN` English Pitcairn Is. → Pitcairn Islands; reading none → ぴとけあんしょとう
  - `PS` English Palestine → Palestinian Territories; Japanese パレスチナ → パレスチナ自治区; short Japanese none → パレスチナ
  - `RU` continent Europe → Asia
  - `SB` English Solomon Is. → Solomon Islands
  - `SC` continent Seven seas (open ocean) → Africa
  - `SH` English Saint Helena → St. Helena; continent Seven seas (open ocean) → Africa
  - `SS` English S. Sudan → South Sudan
  - `ST` English São Tomé and Principe → São Tomé & Príncipe
  - `SZ` English eSwatini → Eswatini
  - `TC` English Turks and Caicos Is. → Turks & Caicos Islands; reading none → たーくすかいこすしょとう
  - `TH` Japanese タイ王国 → タイ; short Japanese タイ → none
  - `TL` continent Asia → Oceania
  - `TR` English Turkey → Türkiye
  - `TT` English Trinidad and Tobago → Trinidad & Tobago
  - `TW` Japanese 中華民国 → 台湾; short Japanese 台湾 → none
  - `US` English United States of America → United States
  - `VA` English Vatican → Vatican City; Japanese バチカン → バチカン市国; reading バチカン → ばちかんしこく
  - `VC` English St. Vin. and Gren. → St. Vincent & Grenadines; Japanese セントビンセント・グレナディーン → セントビンセント及びグレナディーン諸島; reading セントビンセントグレナディーン → せんとびんせんとおよびぐれなでぃーんしょとう
  - `VG` English British Virgin Is. → British Virgin Islands; Japanese イギリス領ヴァージン諸島 → 英領ヴァージン諸島; reading none → えいりょうゔぁーじんしょとう
  - `VI` English U.S. Virgin Is. → U.S. Virgin Islands; Japanese アメリカ領ヴァージン諸島 → 米領ヴァージン諸島; reading none → べいりょうゔぁーじんしょとう
  - `WF` English Wallis and Futuna Is. → Wallis & Futuna
  - `XK` Japanese コソボ共和国 → コソボ; reading こそぼきょうわこく → コソボ; three-letter code KOS → XKK
  - `ZA` Japanese 南アフリカ共和国 → 南アフリカ; short Japanese 南アフリカ → none
- **Argentina** (`divisions/ar`): `B` English Buenos Aires → Buenos Aires Province
- **Belgium** (`divisions/be`): `BRU` English Brussels Capital → Brussels · `WLX` Japanese ルクセンブルク広域行政区 → リュクサンブール州
- **Brazil** (`divisions/br`): `DF` English Federal → Federal District · `SE` Japanese セルジペ州 → セルジッペ州
- **Canada** (`divisions/ca`): `NB` Japanese ニュー・ブランズウィック州 → ニューブランズウィック州
- **Switzerland** (`divisions/ch`): `GR` English Grisons → Graubünden
- **Chile** (`divisions/cl`): `BI` English Biobío → Bío Bío · `LI` English O'Higgins → Libertador General Bernardo O’Higgins · `MA` English Magellan and the Chilean Antarctic → Magallanes Region · `RM` English Santiago → Santiago Metropolitan
- **Germany** (`divisions/de`): `HB` English Free Hanseatic Bremen → Bremen · `MV` English Mecklenburg-Western Pomerania → Mecklenburg-Vorpommern
- **Spain** (`divisions/es`): `CS` Japanese カステリョン → カステリョン県 · `LO` English La Rioja → La Rioja Province · `M` English Community of Madrid → Madrid Province; Japanese マドリード州 → マドリード県 · `MU` Japanese ムルシア州 → ムルシア県 · `NA` English Navarre → Navarra · `O` English Asturias → Asturias Province · `PM` English Balearic Islands → Balears Province · `S` English Cantabria → Cantabria Province · `VI` English Araba / Álava → Álava
- **France** (`divisions/fr`): `22` English Côtes-d'Armor → Côtes-d’Armor · `64` English Pyrenees-Atlantics → Pyrénées-Atlantiques · `95` English Val-d'Oise → Val-d’Oise
- **United Kingdom** (`divisions/gb`): `GLS` Japanese グロスターシャー → グロスタシャー · `NWP` Japanese ニューポート → シティ・オヴ・ニューポート · `SHN` English Merseyside → Saint Helens; Japanese マージ―サイド → セントヘレンズ · `WRL` English Halton → Wirral; Japanese ハルトン → ウィラル · `ZET` English Shetland Islands → Shetland
- **Ireland** (`divisions/ie`): `CE` Japanese クレア県 → クレア州 · `CN` Japanese キャバン県 → キャバン州 · `CO` Japanese コーク県 → コーク州 · `CO_2` English Cork → Cork City; Japanese コーク県 → コーク市 · `CW` Japanese カーロウ県 → カーロウ州 · `D` English Dublin → Dublin City; Japanese ダブリン県 → ダブリン市 · `D_3` Japanese フィンガル市 → フィンガル · `DL` Japanese ドニゴール県 → ドニゴール州 · `G` Japanese ゴールウェイ県 → ゴールウェイ州 · `G_2` English Galway → Galway City; Japanese ゴールウェイ県 → ゴールウェイ市 · `KE` Japanese キルデア県 → キルデア州 · `KK` Japanese キルケニー県 → キルケニー州 · `KY` Japanese ケリー県 → ケリー州 · `LD` Japanese ロングフォード県 → ロングフォード州 · `LH` Japanese ラウス県 → ラウス州 · `LK` Japanese リムリック県 → リムリック州 · `LK_2` English Limerick → Limerick City; Japanese リムリック県 → リムリック市 · `LM` Japanese リートリム県 → リートリム州 · `LS` Japanese リーシュ県 → リーシュ州 · `MH` Japanese ミーズ県 → ミース州 · `MN` Japanese モナハン県 → モナハン州 · `MO` Japanese メイヨー県 → メイヨー州 · `OY` Japanese オファリー県 → オファリー州 · `RN` Japanese ロスコモン県 → ロスコモン州 · `SO` Japanese スライゴ県 → スライゴ州 · `TA` English Tipperary → North Tipperary; Japanese ティペラリー県 → ノース・ティペラリー · `TA_2` English Tipperary → South Tipperary; Japanese ティペラリー県 → サウス・ティペラリー · `WD` Japanese ウォーターフォード県 → ウォーターフォード州 · `WD_2` English Waterford → Waterford City; Japanese ウォーターフォード県 → ウォーターフォード市 · `WH` Japanese ウェストミーズ県 → ウェストミース州 · `WW` Japanese ウィックロー県 → ウィックロー州 · `WX` Japanese ウェックスフォード県 → ウェックスフォード州
- **Italy** (`divisions/it`): `AO` English Aosta → Aosta Valley; Japanese アオスタ → ヴァッレ・ダオスタ州 · `AQ` English L'Aquila → L’Aquila · `BZ` English Trentino-South Tyrol → South Tyrol; Japanese トレンティーノ＝アルト・アディジェ州 → ボルツァーノ自治県 · `GE` English Liguria → Genoa; Japanese リグーリア州 → ジェノヴァ · `MS` English Massa-Carrara → Massa and Carrara · `TN` Japanese トレン → トレント自治県
- **South Korea** (`divisions/kr`): `29` English Gwangju → Gwangju City · `42` Japanese 江原道 → 江原特別自治道 · `45` Japanese 全羅北道 → 全北特別自治道
- **Mexico** (`divisions/mx`): `DIF` English Mexico → Ciudad de Mexico · `MEX` English State of Mexico → Mexico State
- **Malaysia** (`divisions/my`): `04` English Melaka → Malacca
- **New Zealand** (`divisions/nz`): `BOP` Japanese ベイ・オブ・プレンティ → ベイ・オブ・プレンティ地方 · `HKB` English Hawke's Bay → Hawke’s Bay · `MWT` English Manawatū-Whanganui → Manawatu-Wanganui · `NSN` Japanese ネルソン → ネルソン地方
- **Peru** (`divisions/pe`): `ANC` English Áncash → Ancash · `CAL` English Callao → El Callao · `CUS` English Cusco Departament → Cusco · `HUC` English Huanuco → Huánuco · `LIM` English Lima → Lima Region; Japanese リマ郡 → リマ県
- **Philippines** (`divisions/ph`): `ABR` Japanese アブラ → アブラ州 · `AGN` Japanese 北アグサン → 北アグサン州 · `AGS` Japanese 南アグサン → 南アグサン州 · `AKL` Japanese アクラン → アクラン州 · `ALB` Japanese アルバイ → アルバイ州 · `ANT` Japanese アンティーケ → アンティーケ州 · `APA` Japanese アパヤオ → アパヤオ州 · `AUR` Japanese アウロラ → アウロラ州 · `BAN` Japanese バターン → バターン州 · `BAS` Japanese バシラン → バシラン州 · `BEN` Japanese ベンゲット → ベンゲット州 · `BIL` Japanese ビリラン → ビリラン州 · `BOH` Japanese ボホール → ボホール州 · `BTG` Japanese バタンガス → バタンガス州 · `BTN` Japanese バタネス → バタネス州 · `BUK` Japanese ブキドノン → ブキドノン州 · `BUL` Japanese ブラカン → ブラカン州 · `CAG` Japanese カガヤン → カガヤン州 · `CAM` Japanese カミギン → カミギン州 · `CAN` Japanese 北カマリネス → 北カマリネス州 · `CAP` Japanese カピス → カピス州 · `CAS` Japanese 南カマリネス → 南カマリネス州 · `CAT` Japanese カタンドゥアネス → カタンドゥアネス州 · `CAV` Japanese カヴィテ → カヴィテ州 · `CEB` Japanese セブ → セブ州 · `DAO` Japanese 東ダバオ → 東ダバオ州 · `DAS` Japanese 南ダバオ → 南ダバオ州 · `DAV` Japanese 北ダバオ → 北ダバオ州 · `EAS` Japanese 東サマル → 東サマル州 · `GUI` Japanese ギマラス → ギマラス州 · `IFU` Japanese イフガオ → イフガオ州 · `ILI` Japanese イロイロ → イロイロ州 · `ILN` Japanese 北イロコス → 北イロコス州 · `ILS` Japanese 南イロコス → 南イロコス州 · `ISA` Japanese イサベラ → イサベラ州 · `KAL` Japanese カリンガ → カリンガ州 · `LAG` Japanese ラグナ → ラグナ州 · `LAN` Japanese 北ラナオ → 北ラナオ州 · `LAS` Japanese 南ラナオ → 南ラナオ州 · `LEY` Japanese レイテ → レイテ州 · `LUN` Japanese ラウニオン → ラウニオン州 · `MAD` Japanese マリンドゥケ → マリンドゥケ州 · `MAS` Japanese マスバテ → マスバテ州 · `MDC` Japanese 西ミンドロ → 西ミンドロ州 · `MDR` Japanese 東ミンドロ → 東ミンドロ州 · `MSC` Japanese 西ミサミス → 西ミサミス州 · `MSR` Japanese 東ミサミス → 東ミサミス州 · `NCO` Japanese コタバト → コタバト州 · `NEC` Japanese 西ネグロス → 西ネグロス州 · `NER` Japanese 東ネグロス → 東ネグロス州 · `NSA` Japanese 北サマル → 北サマル州 · `NUE` Japanese ヌエヴァ・エシハ → ヌエヴァ・エシハ州 · `NUV` Japanese ヌエヴァ・ヴィスカヤ → ヌエヴァ・ヴィスカヤ州 · `PAM` Japanese パンパンガ → パンパンガ州 · `PAN` Japanese パンガシナン → パンガシナン州 · `PLW` Japanese パラワン → パラワン州 · `QUE` Japanese ケソン → ケソン州 · `QUI` Japanese キリノ → キリノ州 · `RIZ` Japanese リサール → リサール州 · `ROM` Japanese ロンブロン → ロンブロン州 · `SAR` Japanese サランガニ → サランガニ州 · `SCO` Japanese 南コタバト → 南コタバト州 · `SIG` Japanese シキホル → シキホル州 · `SLE` Japanese 南レイテ → 南レイテ州 · `SLU` Japanese スールー → スールー州 · `SOR` Japanese ソルソゴン → ソルソゴン州 · `SUK` Japanese スルタン・クダラット → スルタン・クダラット州 · `SUN` English Dinagat Islands → Surigao del Norte; Japanese ディナガット諸島 → 北スリガオ州 · `SUR` Japanese 南スリガオ → 南スリガオ州 · `TAR` Japanese タルラック → タルラック州 · `TAW` Japanese タウイタウイ → タウイタウイ州 · `WSA` Japanese サマル → サマル州 · `ZAN` Japanese 北サンボアンガ → 北サンボアンガ州 · `ZAS` Japanese 南サンボアンガ → 南サンボアンガ州 · `ZMB` Japanese サンバレス → サンバレス州 · `ZSI` Japanese サンボアンガ・シブガイ → サンボアンガ・シブガイ州
- **Poland** (`divisions/pl`): `DS` English Lower Silesian Voivodeship → Lower Silesia · `KP` English Kuyavian-Pomeranian Voivodeship → Kuyavia-Pomerania · `LB` English Lubusz Voivodeship → Lubusz · `LD` English Łódź Voivodeship → Łódź · `LU` English Lublin Voivodeship → Lublin · `MA` English Lesser Poland Voivodeship → Lesser Poland · `MZ` English Masovian Voivodeship → Mazovia · `OP` English Opole Voivodeship → Opole · `PD` English Podlaskie Voivodeship → Podlachia · `PK` English Podkarpackie Voivodeship → Subcarpathia · `PM` English Pomeranian Voivodeship → Pomerania · `SK` English Świętokrzyskie Voivodeship → Holy Cross · `SL` English Silesian Voivodeship → Silesia · `WN` English Warmian-Masurian Voivodeship → Warmia-Masuria · `WP` English Greater Poland Voivodeship → Greater Poland · `ZP` English West Pomeranian Voivodeship → West Pomerania
- **Russia** (`divisions/ru`): `AD` English Republic of Adygea → Adygea · `AL` English Altai Republic → Altai · `ALT` English Altai Republic → Altai Krai; Japanese アルタイ共和国 → アルタイ地方 · `CHU` English Chukotka Autonomous Okrug → Chukotka Okrug · `DA` English Republic of Dagestan → Dagestan · `IN` English Republic of Ingushetia → Ingushetia · `KC` English Karachay-Cherkess Republic → Karachay-Cherkess · `KHM` English Khanty-Mansi Autonomous Okrug → Khanty-Mansi · `KK` English Republic of Khakassia → Khakassia · `KL` English Republic of Kalmykia → Kalmykia · `KO` English Komi Republic → Komi · `ME` English Mari El Republic → Mari El · `MO` English Republic of Mordovia → Mordovia · `MOS` English Moscow → Moscow Province; Japanese モスクワ → モスクワ州 · `MOW` Japanese モスクワ州 → モスクワ · `NEN` English Nenets Autonomous Okrug → Nenets · `SA` English Sakha Republic → Sakha · `SE` English Republic of North Ossetia-Alania → North Ossetia-Alania · `TA` English Republic of Tatarstan → Tatarstan · `TY` English Tuva Republic → Tuva · `UA-43` English Autonomous Republic of Crimea → Crimea · `YAN` English Yamalo-Nenets Autonomous Okrug → Yamalo-Nenets Okrug
- **Thailand** (`divisions/th`): `72` English Suphan Buri → Suphanburi
- **Taiwan** (`divisions/tw`): `CYI` English Chiayi → Chiayi City · `CYQ` English Chiayi → Chiayi County · `HSQ` English Hsinchu → Hsinchu County · `TXG` English Taichung City → Taichung
- **United States** (`divisions/us`): `DC` English Washington → Washington DC; Japanese ワシントンD.C. → コロンビア特別区
- **Vietnam** (`divisions/vn`): `26` English Thừa Thiên Huế → Thừa Thiên–Huế; Japanese トゥアティエン＝フエ省 → フエ市 · `39` English Đông Nam Bộ → Đồng Nai; Japanese 東南部 → ドンナイ省 · `43` English Bà Rịa-Vũng Tàu → Bà Rịa–Vũng Tàu · `53` English Northeast Vietnam → Bắc Kạn; Japanese 東北部 → バックカン省 · `66` English Red River Delta → Hưng Yên; Japanese 紅河デルタ → フンイエン省 · `SG` English Ho Chi Minh → Ho Chi Minh City

## [1.0.2] - 2026-10-06

Nothing that was exported has changed. The README is the family's one layout, in full.

### Added

- The README has a picture of the demo on a desk and on a phone, in light and dark, taken from the demo by `pnpm screenshots:readme` (the pictures are in `docs/images/` and are not in the package), a picture for each kind of map (explore, callouts, insets, one country alone, the quiz), an Examples section of eleven examples that run, examples for React, Vue, Svelte and Angular, and an Accessibility section.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, as a job of its own in CI; `src/readme.test.js` holds the README to the family's standard (sections in order, languages on code fences, pictures with alt text and a caption, no marketing words, version pins) in `pnpm check`; `pnpm test:package` fails if a picture or anything under `docs/` is in the packed package.

### Changed

- The README no longer says the mounted map can be pressed "by keyboard": the keyboard moves and zooms it, and choosing a place needs a pointer or a list of the page's own that calls `select` (the Accessibility section says so).
- `pnpm pictures` is `pnpm screenshots:readme`, and takes WebP pictures in light and dark under `docs/images/`; `docs/desktop.jpg` and `docs/phone.jpg` are gone.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Chizu, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.

### Fixed

- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [1.0.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/chizu@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.

## [1.0.0] - 2026-10-01

The map engine of a Japanese study app and the world of Itsutsu's geography, made into a package that both import.

- **Maps from Natural Earth** (public domain, release 5.1.2), made by `scripts/build-data.mjs`, which checks each file against its SHA-256 and writes the same bytes every time:
  `@johnmorrisdotca/chizu/world` (173 countries, one canvas, Miller's projection centred on 155°E), `countries/<code>` (238 countries
  each alone, 1:50m and 1:10m for the small ones), `divisions/<code>` (the regions of 31 countries, 1:10m), and `names` (every country
  in English and Japanese, with the everyday short name and the reading in kana).
- **`@johnmorrisdotca/chizu`**, the engine: windows, five zoom steps, fits and shape frames (`zoomBox`, `focusBox`, `regionBox`, `zoomToFit`,
  `shapeGlyphBox`); insets (Alaska and Hawaii in boxes of their own); a world that goes round (`wrapOffsets`, `wrapIntoBox`); outlines as
  rings with a point on each region's land; `layoutCallouts`, numbered circles in open water with leader lines that never cross, and its
  parts (`placeCallouts`, `calloutSpaces`, `calloutFaults`); `findQuestion` and `pickDistractors`; `placesFromText`; `projectPoint` and
  `unprojectPoint`, held to d3-geo's own; the words in English and Japanese.
- **`@johnmorrisdotca/chizu/draw`**: a map as SVG text, with tones, labels, insets in dashed frames and numbered callouts, in light and dark.
- **`@johnmorrisdotca/chizu/mount`**: `mountChizu`, a map to drag, zoom in five steps and press, by touch, mouse and keyboard, in English and Japanese.
- **`@johnmorrisdotca/chizu/load`**: `loadCountry` and `loadDivisions`, one dynamic import for each file.
- A demo with a map to explore, a which-one-is-this quiz and the callout placer, a Help switch, the cloth patches, and browser tests
  (`pnpm test:demo`) at a phone's width and a desk's, in Chromium and WebKit.

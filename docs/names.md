# Names Chizu prints that are not kuni's first name

Chizu reads every country's and most regions' names from kuni 国 (`@johnmorrisdotca/kuni`, pinned in `package.json`) when its data is built, so the two packages name a place alike. This page lists every place where the map prints something else, with the reason, so that each can move into kuni and be dropped here. The tables are `scripts/data-config.mjs`'s, and a test in `src/docs.test.js` holds this page to them.

## A country's short name

A country is printed with kuni's short English name where kuni has one (Bosnia, Hong Kong, Macao, Myanmar, Palestine, Pitcairn, Cocos Islands), and with its everyday short Japanese name where kuni has one (アメリカ, 香港, マカオ, パレスチナ). The exceptions:

| Code | What the map prints | Why |
| --- | --- | --- |
| US | kuni's full English name | kuni's short form is “US”, an abbreviation; the map prints United States |
| GB | kuni's full English name | kuni's short form is “UK”, an abbreviation; the map prints United Kingdom |
| GB | イギリス, kuni's Japanese name | kuni's short Japanese form is 英国, the written abbreviation; イギリス is the everyday name |

## Names written here until kuni has a short form

| Code | English | Japanese | Reading | Why |
| --- | --- | --- | --- | --- |
| CD | DR Congo | コンゴ民主共和国 | こんごみんしゅきょうわこく | kuni 1.0.0 (CLDR) writes “Congo - Kinshasa” and コンゴ民主共和国(キンシャサ), names that tell the two Congos apart in a list, and has no short form |
| CG | Republic of the Congo | コンゴ共和国 | こんごきょうわこく | kuni 1.0.0 (CLDR) writes “Congo - Brazzaville” and コンゴ共和国(ブラザビル), names that tell the two Congos apart in a list, and has no short form |
| MM | kuni's | ミャンマー | ミャンマー | kuni 1.0.0 (CLDR) writes ミャンマー (ビルマ) with the old name in brackets, and has no short Japanese form |
| CC | kuni's | ココス諸島 | ここすしょとう | kuni 1.0.0 (CLDR) writes ココス(キーリング)諸島 with the second name in brackets; its short English form is Cocos Islands, and this is that name in Japanese |

## Continents

Continents are kuni's, which are UN M49's by way of CLDR, but for these three, where kuni 1.0.0 departs from M49 and Chizu keeps M49's until a kuni that follows it is pinned:

| Code | Chizu | Why |
| --- | --- | --- |
| RU | Europe | UN M49 places Russia in Eastern Europe; kuni 1.0.0 has Asia |
| CY | Asia | UN M49 places Cyprus in Western Asia; kuni 1.0.0 has Europe |
| TL | Asia | UN M49 places Timor-Leste in South-eastern Asia; kuni 1.0.0 has Oceania |

## Regions where kuni's name is not used

A region that is exactly one ISO subdivision takes kuni's names, but for these, where kuni 1.0.0's name is wrong or reads worse on a map and Natural Earth's is kept:

| ISO code | Kept | Why |
| --- | --- | --- |
| GB-PTE | English | kuni 1.0.0 writes Peterborough as “Peter” |
| NZ-MBH | English | kuni 1.0.0 writes Marlborough as “Marl” |
| TW-CYQ | English and Japanese | kuni 1.0.0 swaps Chiayi County (TW-CYQ) and Chiayi City (TW-CYI) |
| TW-CYI | English and Japanese | kuni 1.0.0 swaps Chiayi County (TW-CYQ) and Chiayi City (TW-CYI) |
| CO-DC | English | kuni 1.0.0 calls Bogotá “Capital District”, which names no place on a map |
| PH-COM | English and Japanese | kuni 1.0.0 has the name Davao de Oro gave up in 2019, Compostela Valley |
| RU-BU | English | kuni 1.0.0 (CLDR) writes the adjective, “Buryat”, for the Republic of Buryatia |
| RU-CE | English | kuni 1.0.0 (CLDR) writes the adjective, “Chechen”, for the Chechen Republic |
| RU-CU | English | kuni 1.0.0 (CLDR) writes the adjective, “Chuvash”, for the Chuvash Republic |
| RU-UD | English | kuni 1.0.0 (CLDR) writes the adjective, “Udmurt”, for the Udmurt Republic |
| RU-KB | English | kuni 1.0.0 (CLDR) writes the adjective, “Kabardino-Balkar”, for Kabardino-Balkaria |
| VN-CT | English | kuni 1.0.0 writes Cần Thơ without its marks, unlike every other province of Vietnam |

## Names written for this package

Where two regions of one map would share a name, or a region is not the ISO subdivision kuni names, the name is written here (`NAME_FIXES`):

| Region | English | Japanese |
| --- | --- | --- |
| RU:X01~ | Unnamed piece of the Yamal coast | Natural Earth's (drawn, but left out of quizzes and lists: `unnamed`) |
| IE:D | Dublin City | ダブリン市 |
| IE:D_3 | Natural Earth's | フィンガル |
| IE:CO | Natural Earth's | コーク州 |
| IE:G | Natural Earth's | ゴールウェイ州 |
| IE:LK | Natural Earth's | リムリック州 |
| IE:WD | Natural Earth's | ウォーターフォード州 |
| IE:CO_2 | Cork City | コーク市 |
| IE:G_2 | Galway City | ゴールウェイ市 |
| IE:LK_2 | Limerick City | リムリック市 |
| IE:WD_2 | Waterford City | ウォーターフォード市 |
| IE:TA | North Tipperary | ノース・ティペラリー |
| IE:TA_2 | South Tipperary | サウス・ティペラリー |
| TW:CYQ | Chiayi County | Natural Earth's |
| TW:CYI | Chiayi City | Natural Earth's |
| PH:SUN | Surigao del Norte | 北スリガオ州 |

## Other names

Japan's Kinki region (近畿地方) is its official name, and the one the map prints; Kansai (関西), the name it goes by in speech, is carried in `groupAliases`, so a search or a part named in an address finds it by either.

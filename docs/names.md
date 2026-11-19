# Names Chizu prints that are not kuni's first name

Chizu reads every country's and most regions' names from kuni 国 (`@johnmorrisdotca/kuni`, pinned in `package.json`) when its data is built, so the two packages name a place alike. This page lists every place where the map prints something else, with the reason, so that each can move into kuni and be dropped here. The tables are `scripts/data-config.mjs`'s, and a test in `src/docs.test.js` holds this page to them.

## A country's short name

A country is printed with kuni's short English name where kuni has one (Bosnia, Hong Kong, Macao, Myanmar, Palestine, Pitcairn, Cocos Islands), and with its everyday short Japanese name where kuni has one (アメリカ, 香港, マカオ, パレスチナ). The exceptions:

| Code | What the map prints | Why |
| --- | --- | --- |
| US | kuni's full English name | kuni's short form is “US”, an abbreviation; the map prints United States |
| GB | kuni's full English name | kuni's short form is “UK”, an abbreviation; the map prints United Kingdom |
| GB | イギリス, kuni's Japanese name | kuni's short Japanese form is 英国, the written abbreviation; イギリス is the everyday name |

## Names chizu 1.1.0 wrote, which kuni now has

kuni 1.1.0 took over every name, continent and correction chizu 1.1.0 kept here, and chizu now prints kuni's: the short names DR Congo, Congo (the Republic of the Congo, which chizu 1.1.0 printed as “Republic of the Congo”), ミャンマー and ココス諸島 (`DISPLAY_NAMES` is empty); the continents of UN M49, so Russia is in Europe and Cyprus and Timor-Leste in Asia, and with them South Georgia in South America, Heard Island in Oceania and the British Indian Ocean Territory in Africa (`CONTINENT_OVERRIDES` is empty); and the names of Peterborough, Marlborough, Chiayi County and Chiayi City, Bogotá, Davao de Oro, Buryatia, Chechnya, Chuvashia, Udmurtia, Kabardino-Balkaria and Cần Thơ (`KUNI_NAMES_KEPT_FROM_NATURAL_EARTH` is empty). Kuni's readings are of a country's full name, so the readings of three short names are written here (`SHORT_NAME_READINGS`): コンゴ民主共和国 こんごみんしゅきょうわこく, コンゴ共和国 こんごきょうわこく, ココス諸島 ここすしょとう.

## Names written for this package

Where two regions of one map would share a name, or a region is not the ISO subdivision kuni names, the name is written here (`NAME_FIXES`):

The 23 merged provinces and cities of Vietnam's map of 2025 (`divisions/vn-2025`) have no ISO code yet, so kuni does not name them: each is written here with kuni's names for the old province whose name it kept, which a test holds to kuni's (`src/vietnam.test.js`).

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
| PH:SUN | Surigao del Norte | 北スリガオ州 |
| VN-2025:07 | Tuyên Quang | トゥエンクアン省 |
| VN-2025:02 | Lào Cai | ラオカイ省 |
| VN-2025:69 | Thái Nguyên | タイグエン省 |
| VN-2025:68 | Phú Thọ | フート省 |
| VN-2025:56 | Bắc Ninh | バクニン省 |
| VN-2025:66 | Hưng Yên | フンイエン省 |
| VN-2025:HP | Haiphong | ハイフォン |
| VN-2025:18 | Ninh Bình | ニンビン省 |
| VN-2025:25 | Quảng Trị | クアンチ省 |
| VN-2025:DN | Da Nang | ダナン |
| VN-2025:29 | Quảng Ngãi | クアンガイ省 |
| VN-2025:30 | Gia Lai | ザライ省 |
| VN-2025:34 | Khánh Hòa | カインホア省 |
| VN-2025:35 | Lâm Đồng | ラムドン省 |
| VN-2025:33 | Đắk Lắk | ダクラク省 |
| VN-2025:SG | Ho Chi Minh City | ホーチミン市 |
| VN-2025:39 | Đồng Nai | ドンナイ省 |
| VN-2025:37 | Tây Ninh | タイニン省 |
| VN-2025:CT | Cần Thơ | カントー |
| VN-2025:49 | Vĩnh Long | ヴィンロン省 |
| VN-2025:45 | Đồng Tháp | ドンタップ省 |
| VN-2025:59 | Cà Mau | カマウ省 |
| VN-2025:44 | An Giang | アンザン省 |
| VN-2025:26 | Huế, a city since 2025-01-01 (Resolution 175/2024/QH15; kuni: Thừa Thiên–Huế) | kuni's (フエ市) |

Where kuni's English name has macrons, Natural Earth's plain spelling is kept (`KUNI_NAMES_KEPT_FROM_NATURAL_EARTH`); a kuni ticket will make them macron-free, and this list then empties:

| Region | Kept | Reason |
| --- | --- | --- |
| IN-CG | Chhattisgarh, English | Chhattisgarh: kuni 1.6.0 writes its English name with macrons; Natural Earth's plain spelling is kept until kuni's is macron-free |
| IN-TS | Telangana, English | Telangana: kuni 1.6.0 writes its English name with macrons; Natural Earth's plain spelling is kept until kuni's is macron-free |
| IN-UK | Uttarakhand, English | Uttarakhand: kuni 1.6.0 writes its English name with macrons; Natural Earth's plain spelling is kept until kuni's is macron-free |
| IN-DH | Dadra and Nagar Haveli and Daman and Diu, English | Dadra and Nagar Haveli and Daman and Diu: kuni 1.6.0 writes its English name with macrons; Natural Earth's plain spelling is kept until kuni's is macron-free |

## Other names

Japan's eight regions are kuni's grouping `jp-regions-8`. Kinki (近畿地方) is its official name, and the one the map prints; Kansai (関西地方, 関西), the name it goes by in speech, is kuni's other name for it and is carried in `groupAliases`, so a search or a part named in an address finds it by either.

The names of the seas, lakes, rivers, landforms, peaks and capitals are Natural Earth's, Wikidata's and kuni's: [features.md](features.md) says which is whose.

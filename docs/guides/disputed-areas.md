---
title: Disputed areas and how chizu draws them
section: explanation
order: 20
description: For each of fifteen disputed places, who holds it, every party's position with its source, each side's own name for it, and what chizu draws, with its code and whether it has a point of view.
---

## The rule

Chizu draws **Natural Earth's lines**, and Natural Earth's rule is **de facto**: a place is drawn in the country that holds it today, and the border between two claimants is the line each holds. It is a rule about who controls a place and not a ruling on who owns it, and the package takes no side. Two places have a point of view you can choose ([points of view](./points-of-view.md)); every region whose status is disputed carries `disputed: true` and a one-line `disputedNote` (`disputedNoteJa` in Japanese) that a page can show beside it.

Two places are drawn the way the UN counts them and not the way they are held: Somaliland is drawn with Somalia (`SO`) and Northern Cyprus with Cyprus (`CY`). Their sections say who holds them in practice.

The overview says, for each place, who holds it and what chizu draws, with the code. Codes are the region's own `code` on the map named. A place that is only part of a country's outline (Crimea inside Russia, the Golan inside Israel) cannot be marked on a region that is not its own, so only the regions listed under "The regions that carry the flag" carry `disputed`.

Each place then has a section with the names each side uses for it and one line for the position of every party, each with the document it rests on (`[S1]` is the first source in the list at the end). The lines say what a party holds or claims and take no side. The sources are governments' and the UN's own documents where they could be read, and a standard reference otherwise; a position is on record and is not legal advice. **The order of the names:** the name of the party whose view the map's default draws the place with comes first, and the other parties follow in the alphabetical order of their countries' English names. That is the map's default and not a preference. Where the map draws no side alone (Kashmir) or draws nothing (the Senkaku Islands and Takeshima are too small for 1:50m) the name of the party that holds the place today comes first, and where the map draws a place with the UN's view (Somaliland, Northern Cyprus) the name of that country comes first.

## The fifteen places

| Place | Held in practice by | What chizu draws |
| --- | --- | --- |
| [Crimea and Sevastopol](#crimea-and-sevastopol) | Russia, since 2014 | In Russia on the world and on Russia's own map; on Russia's regions map as the regions `UA-43` and `UA-40` (flagged). **View `ukr`** draws them in Ukraine and takes the two regions off Russia's map |
| [Northern Territories](#northern-territories) | Russia, since 1945 | In Russia. At 1:110m they are too small to draw. **View `jpn`** draws them in Japan on the finer world and on Japan's and Russia's own maps |
| [Senkaku Islands](#senkaku-islands) | Japan | Not drawn: too small at 1:50m |
| [Takeshima](#takeshima) | South Korea | Not drawn: too small at 1:50m |
| [Taiwan](#taiwan) | The government in Taipei | `TW` (flagged) on the world and on its own map, with its regions map |
| [Abkhazia and South Ossetia](#abkhazia-and-south-ossetia) | Their own authorities, with Russian forces | Inside Georgia (`GE`); no region of their own (chizu has no map of Georgia's regions) |
| [Transnistria](#transnistria) | Its own authorities | Inside Moldova (`MD`); no region of its own |
| [Kashmir](#kashmir) | India, Pakistan and China, each a part, along the line of control | India's regions map has `JK` (flagged) and `LA` (flagged); the world has India and Pakistan meeting on the line of control |
| [Aksai Chin](#aksai-chin) | China | In China, so inside no region of India; India's `LA` (flagged) does not include it |
| [Arunachal Pradesh](#arunachal-pradesh) | India | India's regions map has `AR` (flagged) |
| [Golan Heights](#golan-heights) | Israel, since 1967 | In Israel (`IL`) on the world; no region of its own |
| [Western Sahara](#western-sahara) | Morocco, most of it; the Polisario Front the part east of the berm | `EH` (flagged) on the world and on its own map, beside Morocco's `MA`; the rest is inside Morocco's outline |
| [Northern Cyprus](#northern-cyprus) | Turkish forces and the Turkish Cypriot authorities, since 1974 | Drawn with Cyprus (`CY`), as part of its outline on every map, joined to it along the line they share and the UN buffer zone; never a region of its own |
| [Somaliland](#somaliland) | The Somaliland government, most of it | Drawn with Somalia (`SO`), as part of its outline on every map, joined to it along their border; never a region of its own |
| [Kosovo](#kosovo) | The government in Pristina, with UNMIK and KFOR present | `XK` (flagged) on the world and on its own map, a country like any other |

## The places

### Crimea and Sevastopol

**Names:** Крым, Республика Крым, город федерального значения Севастополь (Russia, in Russian); Крим, Автономна Республіка Крим, Севастополь (Ukraine, in Ukrainian). The map's default draws them in Russia, so Russia's names are first. **Held:** by Russia since March 2014.

- **Russia:** Crimea and Sevastopol were admitted to the Russian Federation in March 2014, as the Republic of Crimea and the federal city of Sevastopol. [S3]
- **Ukraine:** The Autonomous Republic of Crimea is an inseparable part of Ukraine, temporarily occupied by Russia. [S2]
- **UN General Assembly:** Resolution 68/262 (2014; 100 for, 11 against, 58 abstaining) affirms Ukraine's territorial integrity within its internationally recognised borders and says the referendum of 16 March 2014 has no validity. [S1]
- **ISO 3166:** Lists Crimea and Sevastopol as `UA-43` and `UA-40`, regions of Ukraine. [S15]

### Northern Territories

**Names:** Южные Курилы, Итуруп, Кунашир, Шикотан, Хабомаи (Russia, in Russian); 北方領土, 択捉島, 国後島, 色丹島, 歯舞群島 (Japan). The map's default draws the islands in Russia, so Russia's names are first. **Held:** by Russia since 1945, as part of Sakhalin Oblast.

- **Russia:** The islands passed to the Soviet Union as a result of the Second World War, and Russia's sovereignty over them is not in question; Russia and Japan have no peace treaty. [S5]
- **Japan:** The four islands are Japan's inherent territory and are illegally occupied by Russia. [S4]
- **Both, and the UN:** No UN resolution deals with them. Both governments name the Japan-Soviet Joint Declaration of 1956 as a basis for talks; in its Article 9 the Soviet Union agrees to hand over the Habomai islets and Shikotan after a peace treaty. [S4] [S5]

### Senkaku Islands

**Names:** 尖閣諸島 (Senkaku Shotō; Japan); 钓鱼岛 (Diàoyú Dǎo; China, with "钓鱼岛及其附属岛屿" for the group); 釣魚臺 (Diàoyútái, in full 釣魚臺列嶼, "Diaoyutai Islands"; Taiwan). Japan holds the islands today, so Japan's name is first; the others follow in the alphabetical order of their countries. Not drawn on any map.

- **Japan:** The islands are Japan's inherent territory and under its valid control, and no issue of territorial sovereignty exists to be resolved; administration reverted to Japan on 15 May 1972. [S6]
- **China:** Diaoyu Dao and its affiliated islands are an inherent part of Chinese territory. [S7]
- **Taiwan:** The Diaoyutai Islands are territory of the Republic of China attached to Taiwan; Taiwan proposes setting the dispute aside under its East China Sea Peace Initiative. [S8]
- **United States:** Takes no position on who has sovereignty, and treats the islands as under Japanese administration. [S9]

### Takeshima

**Names:** 독도 (Dokdo; Korea); 竹島 (Takeshima; Japan). South Korea holds the islets today, so Korea's name is first. "Liancourt Rocks" is a third name used in some reference works and is no party's own. Not drawn on any map.

- **South Korea:** Dokdo is an integral part of Korean territory, historically, geographically and under international law, and no territorial dispute exists. [S11]
- **Japan:** Takeshima is Japan's inherent territory, and the Korean occupation has no legal basis; Japan has proposed referring the matter to the International Court of Justice. [S10]
- **UN:** No UN resolution deals with it.

### Taiwan

**Names:** 臺灣 and 中華民國 (Taiwan; the Republic of China, as the government in Taipei calls itself); 台湾 and 中国台湾 (the People's Republic of China, which writes "China's Taiwan"). The map draws Taiwan as a country of its own, so Taiwan's names are first. **Held:** the government in Taipei governs Taiwan, Penghu, Kinmen and Matsu.

- **Taiwan (Republic of China):** The Republic of China (Taiwan) is a sovereign, independent country; resolution 2758 settles who represents China at the UN and does not say Taiwan is part of the People's Republic. [S13]
- **China (People's Republic):** Taiwan is part of China, and the government of the People's Republic is the sole legitimate government of all China. [S12]
- **UN General Assembly:** Resolution 2758 (1971; 76 for, 35 against, 17 abstaining) recognises the representatives of the People's Republic as the only legitimate representatives of China to the UN, and does not mention Taiwan. The UN's statistics division counts Taiwan Province of China as part of China. [S14]
- **ISO 3166:** The code `TW` is "Taiwan, Province of China". [S15]

### Abkhazia and South Ossetia

**Names:** აფხაზეთი, ცხინვალის რეგიონი, სამხრეთ ოსეთი (Georgia, in Georgian); Аҧсны (Apsny; Abkhazia, in Abkhaz); Республика Абхазия, Республика Южная Осетия, Хуссар Ирыстон (Russia and the South Ossetian authorities, in Russian and Ossetian). The map draws both inside Georgia, so Georgia's names are first. **Held:** by their own authorities, with Russian forces, since the wars of 1991 to 1993; Russia recognised them on 26 August 2008.

- **Georgia:** Both are part of Georgia, within its internationally recognised borders. [S16]
- **Russia:** Both are independent states, which Russia recognised by decree on 26 August 2008. [S17]
- **Abkhazia (authorities):** The Republic of Abkhazia (Apsny) is a sovereign state. [S18]
- **South Ossetia (authorities):** The Republic of South Ossetia is an independent state. [S19]
- **UN Security Council and General Assembly:** Security Council resolution 1808 (2008) reaffirms Georgia's sovereignty and territorial integrity within its internationally recognised borders; General Assembly resolution 79/292 (2025; 107 for, 9 against, 49 abstaining) recognises the right of displaced people to return throughout Georgia, Abkhazia and the Tskhinvali region/South Ossetia included. [S20]

### Transnistria

**Names:** "Transnistria", "Stânga Nistrului" and, in Moldova's law, "the localities on the left bank of the Dniester" (Moldova); Приднестровская Молдавская Республика (Transnistria's authorities, in Russian). The map draws it inside Moldova, so Moldova's names are first. **Held:** by its own authorities since the war and ceasefire of 1992, with a Russian military group stationed there.

- **Moldova:** Transnistria is part of Moldova's inalienable territory; the Constitution allows its left-bank localities a special form of autonomy and forbids foreign troops on Moldovan soil. [S21]
- **Russia:** Supports Moldova's territorial integrity, does not recognise Transnistria, and acts as mediator and guarantor of the settlement, with a special status for Transnistria within Moldova. [S22]
- **Transnistria (authorities):** The Pridnestrovian Moldavian Republic is a sovereign, independent state. [S23]
- **UN General Assembly:** Resolution 72/282 (2018; 64 for, 15 against, 83 abstaining) expresses concern at the Russian military group stationed without Moldova's consent and urges its withdrawal. [S24]

### Kashmir

**Names:** 克什米尔 (Kèshímǐ'ěr; China); जम्मू और कश्मीर and लद्दाख (India); آزاد جموں و کشمیر and گلگت بلتستان (Pakistan). The map draws no side alone but the line of control, so the names follow in the alphabetical order of the countries. **Held:** India holds the valley, Jammu and Ladakh; Pakistan holds Azad Jammu and Kashmir and Gilgit-Baltistan; China holds Aksai Chin and the Shaksgam area; the line of control divides the first two.

- **China:** Kashmir is a question left from the past between India and Pakistan, to be settled by them peacefully; the Shaksgam area belongs to China under its boundary agreement with Pakistan. [S27]
- **India:** The whole of the union territories of Jammu and Kashmir and of Ladakh, including the parts Pakistan and China hold, is an integral and inalienable part of India. [S25]
- **Pakistan:** Jammu and Kashmir is a disputed territory whose final status is to be decided by a plebiscite under UN auspices. [S26]
- **UN Security Council:** Resolution 47 (1948) provides for a free and impartial plebiscite on the State's accession; the line of control follows the ceasefire line of 1949 as the Simla Agreement of 1972 defined it. [S28]
- **ISO 3166:** Lists `IN-JK` and `IN-LA` for India and `PK-JK` and `PK-GB` for Pakistan. [S15]

### Aksai Chin

**Names:** 阿克赛钦 (Àkèsàiqīn; China); अक्साई चिन (Aksāī Chin; India). The map draws it in China, which holds it, so China's name is first.

- **China:** It lies in the western sector of the China-India boundary and is Chinese territory; China does not accept India's Union Territory of Ladakh there. [S29]
- **India:** About 38,000 square kilometres of Ladakh are under China's illegal occupation. [S25]

### Arunachal Pradesh

**Names:** अरुणाचल प्रदेश (Aruṇāchal Pradesh; India); 藏南 (Zàngnán, "South Tibet"; China). The map draws it in India, which administers it as a state (since 1987), so India's name is first.

- **India:** Arunachal Pradesh is, has been and will always be an integral and inalienable part of India. [S30]
- **China:** Zangnan is Chinese territory, and China does not recognise the "so-called Arunachal Pradesh"; it publishes lists of names for places in it. [S31]

### Golan Heights

**Names:** רמת הגולן (Ramat HaGolan; Israel); الجولان and "الجولان السوري المحتل" (al-Jawlān, "the occupied Syrian Golan"; Syria). The map draws it in Israel, which has held it since June 1967, so Israel's name is first.

- **Israel:** The Golan Heights Law of 1981 applies Israel's law, jurisdiction and administration to the Heights. [S32]
- **Syria:** The Golan is Syrian territory occupied by Israel, and Syria calls for Israel's withdrawal. [S35]
- **UN Security Council:** Resolution 497 (1981, unanimous) calls the Israeli decision "null and void and without international legal effect" and the place the "occupied Syrian Golan Heights". [S33]
- **United States:** Proclamation 9852 (25 March 2019) recognises the Golan Heights as part of the State of Israel. [S34]

### Western Sahara

**Names:** الصحراء المغربية (the Moroccan Sahara; Morocco); الصحراء الغربية, Sáhara Occidental, Sahara occidental (Western Sahara; the UN, in Arabic, Spanish and French). Morocco administers most of it, and the map's default draws everything but the part it keeps apart as `EH` inside Morocco's outline, so Morocco's name is first. **Held:** Morocco administers the larger part, west of the berm; the Polisario Front holds the area east of it.

- **Morocco:** The territory is under Moroccan sovereignty, and Morocco proposes an autonomy statute for the Sahara region. [S36]
- **Polisario Front:** The status of the territory must be settled by the self-determination of the Sahrawi people; the Sahrawi Arab Democratic Republic is its government. [S37]
- **United Nations:** The territory has been on the UN's list of non-self-governing territories since 1963. Security Council resolution 2797 (2025; 11 for, none against, 3 abstaining) says genuine autonomy under Moroccan sovereignty "could constitute a most feasible solution" and calls for talks on that basis; the International Court of Justice found in 1975 no tie of territorial sovereignty with Morocco or Mauritania that would affect self-determination. [S38]

### Northern Cyprus

**Names:** Κυπριακή Δημοκρατία and "τα κατεχόμενα", "the occupied areas" (the Republic of Cyprus, in Greek); Kuzey Kıbrıs Türk Cumhuriyeti, KKTC (Turkey and the Turkish Cypriot authorities, in Turkish). The map draws the north with Cyprus (`CY`) and as part of it, so the Republic of Cyprus's names come first. **Held:** by Turkish forces and the Turkish Cypriot authorities since July 1974; a UN buffer zone, about 180 km long, runs between the two sides.

- **Republic of Cyprus:** It is the only internationally recognised state on the island, and Turkey has unlawfully occupied about 36 per cent of its territory since 1974. [S39]
- **Turkey:** There are two peoples and two states on the island, the "Turkish Republic of Northern Cyprus" has been a state since 1983, and its recognition is vital. [S40]
- **Turkish Cypriot authorities:** The declaration of 15 November 1983 was an exercise of the Turkish Cypriots' sovereign rights, voted unanimously by their parliament. [S41]
- **UN Security Council:** Resolution 541 (1983) calls the declaration legally invalid and asks all states not to recognise any Cypriot state other than the Republic of Cyprus; resolution 550 (1984) condemns the secessionist actions. [S42]

### Somaliland

**Names:** Soomaaliya and Jamhuuriyadda Federaalka Soomaaliya (Somalia, in Somali); Soomaaliland and أرض الصومال (Somaliland, in Somali and Arabic). The map draws Somaliland with Somalia (`SO`) and as part of it, so Somalia's names come first. **Held:** the Somaliland government holds most of the area it claims, including Hargeisa and Berbera, and has done so since 1991; its forces left Las Anod in August 2023, and the north-east is held by the North-Eastern State, a federal member state of Somalia since 2025. [S48]

- **Somalia:** Somaliland is part of Somalia, whose territory its Provisional Constitution calls inviolable and indivisible; it rejected Israel's recognition of Somaliland as illegal. [S43]
- **Somaliland:** It re-established its independence on 18 May 1991 and is a sovereign state. [S44]
- **African Union:** Has not recognised Somaliland; its fact-finding mission of 2005 called the case for recognition "historically unique and self-justified in African political history" and urged a special method of dealing with it. [S45]
- **Israel:** Recognised Somaliland on 26 December 2025, the first UN member state to do so. [S46]
- **Ethiopia:** Its Ankara Declaration with Somalia (11 December 2024) reaffirms each side's sovereignty and territorial integrity; Ethiopia had signed a memorandum of understanding with Somaliland in January 2024. [S47]
- **United Nations:** Somalia is a member as one state; no UN body has recognised Somaliland. [S49]

### Kosovo

**Names:** Kosova and Republika e Kosovës (Kosovo, in Albanian); Косово и Метохија, Kosovo i Metohija (Serbia, in Serbian). The map draws Kosovo as a country of its own, so Kosovo's names are first. **Held:** by the government in Pristina, with the UN's mission (UNMIK) and NATO's force (KFOR) present under resolution 1244.

- **Kosovo:** Kosovo is an independent, sovereign, democratic, unique and indivisible state, declared on 17 February 2008; its foreign ministry lists 117 states that recognise it, a count that is itself disputed. [S50] [S55]
- **Serbia:** Kosovo and Metohija is an integral part of Serbia, with substantial autonomy. [S51]
- **UN Security Council and the International Court of Justice:** Resolution 1244 (1999) reaffirms the territorial integrity of the Federal Republic of Yugoslavia and calls for substantial autonomy for Kosovo; the Court's opinion of 2010 is that the declaration of independence did not violate international law. [S52]
- **Russia:** Does not recognise Kosovo and treats it as Serbia's southern province under resolution 1244. [S53]
- **China:** Does not recognise Kosovo's independence and respects Serbia's sovereignty and territorial integrity. [S54]
- **ISO 3166:** Has no code for Kosovo; `XK` is user-assigned. [S15]

## The regions that carry the flag

Eight regions say `disputed: true`, on every map that draws them: `XK`, `TW` and `EH` on the world, the finer world and each one's own map; `UA-43` and `UA-40` on Russia's regions map; and `AR`, `JK` and `LA` on India's. Nothing else is marked, and the flag is three fields added to eight regions, and no map's drawing changes.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";

const disputed = WORLD.regions.filter((region) => region.disputed);
console.log(disputed.map((region) => region.code).sort().join(" "));
// EH TW XK
console.log(disputed.find((region) => region.code === "XK")!.disputedNote);
// Kosovo declared independence in 2008 and many states recognise it, but Serbia and others do not; XK is a user-assigned code, not an ISO 3166-1 one.
```

## What is not covered

Palestine (`PS`) is drawn as a country of its own, as the General Assembly's non-member observer state (2012), and is not flagged here. The disputed seas (the sea between Japan and Korea, the Persian Gulf) are named as the sources have them ([features](../features.md)). The regions maps of Russia, Japan and India are Natural Earth's and take no view except that `ukr` removes two regions of Russia's. Other places whose status is questioned are not in the list.

## Sources

Read between 2026-11-18 and 2026-11-26. A UN document is at `documents.un.org/api/symbol/access?s=<symbol>&l=en&t=pdf`, with the symbol written below. Where a government's site did not answer an automated reader, the source says how it was read.

- **S1** UN General Assembly, resolution 68/262, "Territorial integrity of Ukraine", 27 March 2014 (A/RES/68/262); the vote is in the record of the 80th plenary meeting (A/68/PV.80).
- **S2** Constitution of Ukraine, Articles 2, 133 and 134 (<https://zakon.rada.gov.ua/laws/show/254%D0%BA/96-%D0%B2%D1%80/print>); Law of Ukraine No. 1207-VII of 15 April 2014, Article 1 (<https://zakon.rada.gov.ua/laws/show/1207-18/print>).
- **S3** Federal Constitutional Law No. 6-FKZ of 21 March 2014 on the admission of the Republic of Crimea to the Russian Federation (<http://en.kremlin.ru/events/president/news/20625>); Constitution of the Russian Federation, Article 65 (<http://www.kremlin.ru/acts/constitution/item>).
- **S4** Cabinet Office of Japan, "北方領土問題とは" (<https://www8.cao.go.jp/hoppo/mondai/01.html>); Ministry of Foreign Affairs of Japan, "Northern Territories Issue" (<https://www.mofa.go.jp/region/europe/russia/territory/overview.html>, read from the Internet Archive's copy).
- **S5** Russian Ministry of Foreign Affairs spokesperson, 10 August 2025, as reported by Sputnik (<https://www.globalsecurity.org/military/library/news/2025/08/mil-250810-sputnik01.htm>; the ministry's own site could not be read); President of Russia, statement for the press, 22 January 2019 (<http://en.kremlin.ru/catalog/countries/JP/events/59714>).
- **S6** Ministry of Foreign Affairs of Japan, "Senkaku Islands Q&A" (<https://www.mofa.go.jp/region/asia-paci/senkaku/qa_1010.html>, read from the Internet Archive's copy).
- **S7** State Council Information Office of China, white paper "Diaoyu Dao, an Inherent Territory of China", September 2012 (<https://www.mfa.gov.cn/web/ziliao_674904/zcwj_674915/201209/t20120925_7949931.shtml>; English: <https://us.china-embassy.gov.cn/eng/zt/bps/201209/t20120928_4911413.htm>).
- **S8** Taiwan, "The Republic of China (Taiwan) Proposes: The East China Sea Peace Initiative" (<https://www.taiwan.gov.tw/images/ufile/file20160929135437871.pdf>).
- **S9** Congressional Research Service, report R42761 on the Senkaku or Diaoyu Islands, updated 1 March 2021 (<https://www.everycrsreport.com/reports/R42761.html>).
- **S10** Ministry of Foreign Affairs of Japan, "An Outline of the Japanese Position on Sovereignty over Takeshima and the Illegal Occupation by the Republic of Korea" (<https://www.mofa.go.jp/region/asia-paci/takeshima/position.html>, read from the Internet Archive's copy).
- **S11** Ministry of Foreign Affairs of the Republic of Korea, "The Korean Government's Basic Position on Dokdo" (<https://dokdo.mofa.go.kr/eng/dokdo/government_position.jsp>).
- **S12** Ministry of Foreign Affairs of the People's Republic of China, "China's Position Paper on the United Nations General Assembly Resolution 2758", 30 September 2025 (<https://www.mfa.gov.cn/eng/xw/zyxw/202509/t20250930_11721842.html>); Anti-Secession Law of 14 March 2005, Article 2 (<https://us.china-embassy.gov.cn/eng./zt/twwt/200503/t20050315_4912997.htm>).
- **S13** Ministry of Foreign Affairs of the Republic of China (Taiwan), "Taiwan's rebuttal to UNGA Resolution 2758", 2022 (on <https://roc-taiwan.org>); Additional Articles of the Constitution of the Republic of China (<https://law.moj.gov.tw/ENG/LawClass/LawAll.aspx?pcode=A0000002>).
- **S14** UN General Assembly, resolution 2758 (XXVI), "Restoration of the lawful rights of the People's Republic of China in the United Nations", 25 October 1971 (A/RES/2758(XXVI); vote in A/PV.1976); UN Statistics Division, Standard country or area codes for statistical use (M49) (<https://unstats.un.org/unsd/methodology/m49/>).
- **S15** ISO 3166-1 and ISO 3166-2 code lists, International Organization for Standardization (<https://www.iso.org/obp/ui/>); the site did not answer an automated reader, so the names were taken from the UN Statistics Division's M49 list and the code lists as published.
- **S16** Constitution of Georgia, Article 1 (<https://matsne.gov.ge/en/document/view/30346?publication=36>).
- **S17** President of Russia, statement on the recognition of South Ossetia and Abkhazia, 26 August 2008 (<http://en.kremlin.ru/events/president/transcripts/1222>).
- **S18** Ministry of Foreign Affairs of the Republic of Abkhazia (<https://mid.apsny.land/en/>).
- **S19** Ministry of Foreign Affairs of the Republic of South Ossetia (<https://mfa-rso.su>, read from the Internet Archive's copy).
- **S20** UN Security Council, resolution 1808 (2008), 15 April 2008 (S/RES/1808(2008)); UN General Assembly, resolution 79/292, 3 June 2025 (A/RES/79/292; vote in A/79/PV.74).
- **S21** Constitution of the Republic of Moldova, Articles 1, 3, 11 and 110 (<https://www.constituteproject.org/constitution/Moldova_2016>, an unofficial reproduction of the English text).
- **S22** TASS, 20 September 2024, statement by the Russian foreign ministry's spokesperson on Transnistria (<https://tass.com/politics/1845679>); Interfax-Ukraine, 27 May 2010, on the Russian foreign minister's statement (<https://archive.kyivpost.com/article/content/eastern-europe/lavrov-russia-backs-moldovas-territorial-integrity-67818.html>). Both are press reports; Russia's own site could not be read.
- **S23** Constitution of the Pridnestrovian Moldavian Republic, Article 1 (<https://en.wikisource.org/wiki/Constitution_of_the_Pridnestrovian_Moldavian_Republic>, an unofficial copy).
- **S24** UN General Assembly, resolution 72/282, "Complete and unconditional withdrawal of foreign military forces from the territory of the Republic of Moldova", 22 June 2018 (A/RES/72/282; vote in A/72/PV.98).
- **S25** Ministry of External Affairs of India, weekly media briefing, 9 January 2026 (<https://mea.gov.in/media-briefings.htm?dtl%2F40576%2FTranscript_of_Weekly_Media_Briefing_by_the_Official_Spokesperson_January_09_2026=>); Press Information Bureau, statement of the Defence Minister in the Rajya Sabha, 17 September 2020 (<https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=1655521&reg=48&lang=2>).
- **S26** Constitution of Pakistan, Article 257 (<https://na.gov.pk/uploads/documents/63e602ca09b5d_461.pdf>); Ministry of Foreign Affairs of Pakistan, press briefing of 8 August 2019 (<https://mofa.gov.pk/transcript-of-the-press-briefing-by-spokesperson-on-thursday-8th-august-2019-2>).
- **S27** Ministry of Foreign Affairs of the People's Republic of China, remarks of 6 August 2019 (<https://www.mfa.gov.cn/eng/xw/fyrbt/fyrbt/202405/t20240530_11349613.html>) and press conference of 12 January 2026 on the Shaksgam area (<https://www.fmprc.gov.cn/mfa_eng/xw/fyrbt/202601/t20260112_11811345.html>).
- **S28** UN Security Council, resolution 47 (1948), 21 April 1948 (S/RES/47(1948)); United Nations Military Observer Group in India and Pakistan, background (<https://unmogip.unmissions.org/en/unmogip-background>).
- **S29** Ministry of Foreign Affairs of the People's Republic of China, press conference of 13 October 2026 (<https://www.mfa.gov.cn/eng/xw/fyrbt/202610/t20261013_12039583.html>).
- **S30** Ministry of External Affairs of India, spokesperson's response of 4 April 2023 (<https://mea.gov.in/response-to-queries.htm?dtl%2F36450%2FOfficial_Spokespersons_response_to_media_queries_regarding_the_renaming_of_places_in_Arunachal_Pradesh_by_China=>).
- **S31** Ministry of Foreign Affairs of the People's Republic of China, press conference of 14 April 2026 (<https://www.fmprc.gov.cn/eng/xw/fyrbt/202604/t20260414_11891740.html>).
- **S32** The Golan Heights Law, 1981 (text at <https://www.jewishvirtuallibrary.org/the-golan-heights-law>; the Knesset's own copy could not be read).
- **S33** UN Security Council, resolution 497 (1981), 17 December 1981 (S/RES/497(1981)).
- **S34** Proclamation 9852 of 25 March 2019, Federal Register of 28 March 2019 (<https://www.govinfo.gov/content/pkg/FR-2019-03-28/pdf/2019-06199.pdf>).
- **S35** Security Council Report, monthly forecast of October 2026, on the UN Disengagement Observer Force, reporting Syria's statement to the General Assembly on 23 September 2026 (<https://www.securitycouncilreport.org/monthly-forecast/2026-10/undof-golan-14.php>); a Syrian government document could not be read.
- **S36** Morocco, "Moroccan initiative for negotiating an autonomy statute for the Sahara region", 11 April 2007 (S/2007/206).
- **S37** Polisario Front, proposal for a mutually acceptable political solution that provides for the self-determination of the people of Western Sahara, 2007 (S/2007/210).
- **S38** UN Legal Counsel, opinion of 29 January 2002 (S/2002/161); International Court of Justice, advisory opinion on Western Sahara, 16 October 1975 (<https://www.icj-cij.org/case/61>); UN Security Council, resolution 2797 (2025), 31 October 2025 (S/RES/2797(2025); vote in S/PV.10030); Secretary-General's report of 30 September 2025 (S/2025/612).
- **S39** Republic of Cyprus, "1974 Cyprus still occupied still divided" (<https://publications.gov.cy/assets/user/publications/2026/2026_106/HTML/3/>).
- **S40** Ministry of Foreign Affairs of Turkey, "The Cyprus Issue (Overview)" (<https://www.mfa.gov.tr/the-cyprus-issue-overview.en.mfa>).
- **S41** Public Information Office of the Turkish Republic of Northern Cyprus, "The concrete expression of our sovereignty and independence: the TRNC turns 40 today" (<https://pio.mfa.gov.ct.tr/en/the-concrete-expression-of-our-sovereignty-and-independence-the-trnc-turns-40-today/>).
- **S42** UN Security Council, resolutions 541 (1983) and 550 (1984) (S/RES/541(1983), S/RES/550(1984)); UN Peacekeeping Force in Cyprus, about the buffer zone (<https://unficyp.unmissions.org/en/about-buffer-zone>).
- **S43** Provisional Federal Constitution of Somalia, 2012 (<https://constituteproject.org/constitution/Somalia_2012>); Ministry of Foreign Affairs of Somalia, statement on Israel's recognition (<https://web.mfa.gov.so/somali-fm-condemns-israels-illegal-recognition-of-somaliland-region-in-somalia/>).
- **S44** Constitution of Somaliland, 2001, Article 1; Al Jazeera, 26 December 2025 (<https://www.aljazeera.com/news/2025/12/26/israel-becomes-first-country-to-recognise-somaliland>), on Somaliland's independence of 1991. The Somaliland government's own text could not be read.
- **S45** African Union, report of the fact-finding mission to Somaliland, 30 April to 4 May 2005 (<https://www.americanrhetoric.com/speeches/PDFFiles/au-fact-finding-mission-to-somaliland-30-april-to-4-may-2005.pdf>, a copy of the report); Amani Africa on the Peace and Security Council's session of 6 January 2026 (<https://amaniafrica-et.org/emergency-session-on-israels-recognition-of-somaliland/>).
- **S46** Al Jazeera, "Israel becomes first country to recognise Somaliland", 26 December 2025 (<https://www.aljazeera.com/news/2025/12/26/israel-becomes-first-country-to-recognise-somaliland>).
- **S47** Ankara Declaration between Ethiopia and Somalia, 11 December 2024, as published by the Ministry of Foreign Affairs of Turkey (<https://www.mfa.gov.tr/etiyopya-federal-demokratik-cumhuriyeti-ve-somali-federal-cumhuriyeti-nin-ankara-bildirisi.en.mfa>); the memorandum of 2024 with Somaliland is known from news reports only.
- **S48** European Union Agency for Asylum, "Somalia: Security situation", May 2026, with a map of territorial control as of 31 March 2026 (<https://www.ecoi.net/en/file/local/2140751/2026_05_EUAA_COI_Report_Somalia_Security_Situation.pdf>).
- **S49** United Nations, list of Member States (<https://www.un.org/en/about-us/member-states>).
- **S50** Constitution of the Republic of Kosovo, Article 1 (<https://constituteproject.org/constitution/Kosovo_2008>).
- **S51** Constitution of the Republic of Serbia, preamble (<https://constituteproject.org/constitution/Serbia_2006>).
- **S52** UN Security Council, resolution 1244 (1999), 10 June 1999 (S/RES/1244(1999)); International Court of Justice, advisory opinion on the accordance with international law of the unilateral declaration of independence in respect of Kosovo, 22 July 2010 (<https://www.icj-cij.org/case/141>).
- **S53** Permanent Mission of Russia to the UN, statement of 20 October 2026 (<https://russiaun.ru/en/news/720102026>).
- **S54** Ministry of Foreign Affairs of the People's Republic of China, press conference of 3 December 2024 (<https://www.fmprc.gov.cn/mfa_eng/xw/fyrbt/202412/t20241203_11537550.html>).
- **S55** Ministry of Foreign Affairs of Kosovo, list of recognitions (<https://arkivi.mfa-ks.net/en/politika/484/lista-e-njohjeve/484.html>), an undated archive page.

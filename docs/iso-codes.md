# ISO 3166-2 codes on the regions

Every region of a country's map in Chizu carries `iso`, its ISO 3166-2 code, joined at build time from kuni 国
(`@johnmorrisdotca/kuni`), unless ISO 3166-2 has no code for the region Natural Earth draws. These are the ones
without, with the reason the build script gives (`ISO_JOIN` in `scripts/data-config.mjs`). A test in `src/docs.test.js`
holds this page to that table, so a region cannot lose its code without a line here.

## How a region's code is chosen

Every region of a country carries `iso`, its ISO 3166-2 code, unless ISO 3166-2 has no code for the region Natural Earth draws. The code is Natural Earth's when kuni has it, and otherwise the one `ISO_JOIN` in `scripts/data-config.mjs` gives: Paris is `FR-75C` since 2019, Poland's voivodeships are numbered since 2018 (`PL-24`, Silesia), Mexico City is `MX-CMX`, New Taipei `TW-NWT`. Where Natural Earth draws one ISO subdivision as several regions, each carries the code of the one it lies in: County Dublin's four councils are all `IE-D`, Cork City and the county council are both `IE-CO`, a district of Northern Ireland from before 2015 has the code of the district it is part of now (Derry and Strabane, `GB-DRS`). Norway's counties, which Natural Earth draws as they were before the 2020 reform, carry the codes of the counties of 2024 they lie in (Østfold `NO-31`; Hedmark and Oppland both Innlandet, `NO-34`). Crimea and Sevastopol, which Natural Earth draws in Russia, have the codes ISO 3166-2 gives them, `UA-43` and `UA-40`. Tests hold every region to a code or a line in that table, and every code two regions share to a line saying why.

## The regions with no code

These 7 of the 1,342 regions have no code:

| Country | `code` | Region | Why it has no ISO 3166-2 code |
| --- | --- | --- | --- |
| AU | `X02~` | Jervis Bay Territory | Jervis Bay Territory has no ISO 3166-2 code of its own |
| GB | `NTH` | Northamptonshire | Northamptonshire was split in 2021 into North (GB-NNH) and West Northamptonshire (GB-WNH) |
| NO | `X01~` | Bouvet Island | Bouvet Island is a country code of its own in ISO 3166-1 (BV), with no subdivision code |
| PH | `MAG` | Maguindanao | Maguindanao was split in 2022 into Maguindanao del Norte (PH-MGN) and del Sur (PH-MGS) |
| PH | `MNL` | Mandaluyong | Mandaluyong, a city of Metro Manila (PH-00), which ISO 3166-2 does not code on its own |
| PH | `SUN` | Surigao del Norte | Surigao del Norte as it was before 2006, with the Dinagat Islands (now PH-DIN) in it |
| RU | `X01~` | X01~ | a piece of the Yamal coast, 38 km², that Natural Earth draws without a name or a code |

# ISO 3166-2 codes on the regions

Every region of a country's map in Chizu carries `iso`, its ISO 3166-2 code, joined at build time from kuni 国
(`@johnmorrisdotca/kuni`), unless ISO 3166-2 has no code for the region Natural Earth draws. These are the ones
without, with the reason the build script gives (`ISO_JOIN` in `scripts/data-config.mjs`). A test in `src/docs.test.js`
holds this page to that table, so a region cannot lose its code without a line here.

## How a region's code is chosen

Every region of a country carries `iso`, its ISO 3166-2 code, unless ISO 3166-2 has no code for the region Natural Earth draws. The code is Natural Earth's when kuni has it, and otherwise the one `ISO_JOIN` in `scripts/data-config.mjs` gives: Paris is `FR-75C` since 2019, Poland's voivodeships are numbered since 2018 (`PL-24`, Silesia), Mexico City is `MX-CMX`, New Taipei `TW-NWT`, and four of India's states changed code on 2023-11-23 (Odisha is `IN-OD`, Telangana `IN-TS`). Where Natural Earth draws one ISO subdivision as several regions, each carries the code of the one it lies in: County Dublin's four councils are all `IE-D`, Cork City and the county council are both `IE-CO`, a district of Northern Ireland from before 2015 has the code of the district it is part of now (Derry and Strabane, `GB-DRS`). Norway's counties, which Natural Earth draws as they were before the 2020 reform, carry the codes of the counties of 2024 they lie in (Østfold `NO-31`; Hedmark and Oppland both Innlandet, `NO-34`). Crimea and Sevastopol, which Natural Earth draws in Russia, have the codes ISO 3166-2 gives them, `UA-43` and `UA-40`. Vietnam's map of 2025 (`divisions/vn-2025`, its 34 provinces and cities under Resolution 202/2025/QH15) is ahead of ISO 3166-2, which still lists the 63 that `divisions/vn` draws: the 11 that were not merged keep their codes, and the 23 that were have none until ISO 3166-2 codes them, so a figure keyed by ISO code does not colour them, and none is made up here. Each of the 23 keeps, as its `code`, the code of the old province whose name it took (Tuyên Quang `07`, Ho Chi Minh City `SG`); its line in the table is keyed `VN-2025`. On `gb-2025`, the United Kingdom's councils of 2025 beside its own map, England's, Scotland's and Wales's councils are the ONS's, not Natural Earth's: each takes the code of kuni's subdivision of the same English name, or the one `ONS_ISO` in `scripts/data-config/ons.mjs` gives where the ONS writes the name otherwise (Na h-Eileanan Siar is `GB-ELS`, City of Edinburgh `GB-EDH`); Cumberland and Westmorland and Furness, which ISO 3166-2 has not coded, have their ONS codes as their `code`. Its lines in `ISO_JOIN` are keyed `GB-2025:`. Tests hold every region to a code or a line in that table, and every code two regions share to a line saying why.

## The regions with no code

These 32 of the 1,645 regions have no code (the 1,378 of the 33 countries' maps, the 34 of Vietnam's map of 2025 and the 233 of `gb-2025`):

| Country | `code` | Region | Why it has no ISO 3166-2 code |
| --- | --- | --- | --- |
| AU | `X02~` | Jervis Bay Territory | Jervis Bay Territory has no ISO 3166-2 code of its own |
| GB | `NTH` | Northamptonshire | Northamptonshire was split in 2021 into North (GB-NNH) and West Northamptonshire (GB-WNH) |
| GB-2025 | `E06000063` | Cumberland | Cumberland, a unitary authority since 2023, has no ISO 3166-2 code yet |
| GB-2025 | `E06000064` | Westmorland and Furness | Westmorland and Furness, a unitary authority since 2023, has no ISO 3166-2 code yet |
| NO | `X01~` | Bouvet Island | Bouvet Island is a country code of its own in ISO 3166-1 (BV), with no subdivision code |
| PH | `MAG` | Maguindanao | Maguindanao was split in 2022 into Maguindanao del Norte (PH-MGN) and del Sur (PH-MGS) |
| PH | `MNL` | Mandaluyong | Mandaluyong, a city of Metro Manila (PH-00), which ISO 3166-2 does not code on its own |
| PH | `SUN` | Surigao del Norte | Surigao del Norte as it was before 2006, with the Dinagat Islands (now PH-DIN) in it |
| RU | `X01~` | X01~ | a piece of the Yamal coast, 38 km², that Natural Earth draws without a name or a code |
| VN-2025 | `02` | Lào Cai | Lào Cai since 2025-07-01, made of Yên Bái (VN-06) and Lào Cai (VN-02) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `07` | Tuyên Quang | Tuyên Quang since 2025-07-01, made of Hà Giang (VN-03) and Tuyên Quang (VN-07) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `18` | Ninh Bình | Ninh Bình since 2025-07-01, made of Hà Nam (VN-63), Nam Định (VN-67) and Ninh Bình (VN-18) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `25` | Quảng Trị | Quảng Trị since 2025-07-01, made of Quảng Bình (VN-24) and Quảng Trị (VN-25) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `29` | Quảng Ngãi | Quảng Ngãi since 2025-07-01, made of Kon Tum (VN-28) and Quảng Ngãi (VN-29) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `30` | Gia Lai | Gia Lai since 2025-07-01, made of Bình Định (VN-31) and Gia Lai (VN-30) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `33` | Đắk Lắk | Đắk Lắk since 2025-07-01, made of Phú Yên (VN-32) and Đắk Lắk (VN-33) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `34` | Khánh Hòa | Khánh Hòa since 2025-07-01, made of Ninh Thuận (VN-36) and Khánh Hòa (VN-34) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `35` | Lâm Đồng | Lâm Đồng since 2025-07-01, made of Đắk Nông (VN-72), Bình Thuận (VN-40) and Lâm Đồng (VN-35) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `37` | Tây Ninh | Tây Ninh since 2025-07-01, made of Long An (VN-41) and Tây Ninh (VN-37) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `39` | Đồng Nai | Đồng Nai since 2025-07-01, made of Bình Phước (VN-58) and Đồng Nai (VN-39) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `44` | An Giang | An Giang since 2025-07-01, made of Kiên Giang (VN-47) and An Giang (VN-44) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `45` | Đồng Tháp | Đồng Tháp since 2025-07-01, made of Tiền Giang (VN-46) and Đồng Tháp (VN-45) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `49` | Vĩnh Long | Vĩnh Long since 2025-07-01, made of Bến Tre (VN-50), Trà Vinh (VN-51) and Vĩnh Long (VN-49) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `56` | Bắc Ninh | Bắc Ninh since 2025-07-01, made of Bắc Giang (VN-54) and Bắc Ninh (VN-56) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `59` | Cà Mau | Cà Mau since 2025-07-01, made of Bạc Liêu (VN-55) and Cà Mau (VN-59) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `66` | Hưng Yên | Hưng Yên since 2025-07-01, made of Thái Bình (VN-20) and Hưng Yên (VN-66) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `68` | Phú Thọ | Phú Thọ since 2025-07-01, made of Vĩnh Phúc (VN-70), Hòa Bình (VN-14) and Phú Thọ (VN-68) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `69` | Thái Nguyên | Thái Nguyên since 2025-07-01, made of Bắc Kạn (VN-53) and Thái Nguyên (VN-69) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `CT` | Cần Thơ | Cần Thơ since 2025-07-01, made of Cần Thơ (VN-CT), Sóc Trăng (VN-52) and Hậu Giang (VN-73) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `DN` | Da Nang | Da Nang since 2025-07-01, made of Da Nang (VN-DN) and Quảng Nam (VN-27) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `HP` | Haiphong | Haiphong since 2025-07-01, made of Haiphong (VN-HP) and Hải Dương (VN-61) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |
| VN-2025 | `SG` | Ho Chi Minh City | Ho Chi Minh City since 2025-07-01, made of Ho Chi Minh City (VN-SG), Bà Rịa–Vũng Tàu (VN-43) and Bình Dương (VN-57) by Resolution 202/2025/QH15; ISO 3166-2 has no code for it yet |

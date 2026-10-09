# The regions with no ISO 3166-2 code

Every region of a country's map in Chizu carries `iso`, its ISO 3166-2 code, joined at build time from kuni 国
(`@johnmorrisdotca/kuni`), unless ISO 3166-2 has no code for the region Natural Earth draws. These are the ones
without, with the reason the build script gives (`ISO_JOIN` in `scripts/data-config.mjs`). A test in `src/docs.test.js`
holds this page to that table, so a region cannot lose its code without a line here.

These 22 of the 1,342 regions have no code:

| Country | `code` | Region | Why it has no ISO 3166-2 code |
| --- | --- | --- | --- |
| AU | `X02~` | Jervis Bay Territory | Jervis Bay Territory has no ISO 3166-2 code of its own |
| GB | `NTH` | Northamptonshire | Northamptonshire was split in 2021 into North (GB-NNH) and West Northamptonshire (GB-WNH) |
| NO | `X01~` | Bouvet Island | Bouvet Island is a country code of its own in ISO 3166-1 (BV), with no subdivision code |
| NO | `01` | Østfold | Østfold, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Viken (NO-30), and not yet the codes of 2024 |
| NO | `02` | Akershus | Akershus, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Viken (NO-30), and not yet the codes of 2024 |
| NO | `06` | Buskerud | Buskerud, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Viken (NO-30), and not yet the codes of 2024 |
| NO | `04` | Hedmark | Hedmark, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Innlandet (NO-34), and not yet the codes of 2024 |
| NO | `05` | Oppland | Oppland, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Innlandet (NO-34), and not yet the codes of 2024 |
| NO | `07` | Vestfold | Vestfold, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Vestfold og Telemark (NO-38), and not yet the codes of 2024 |
| NO | `08` | Telemark | Telemark, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Vestfold og Telemark (NO-38), and not yet the codes of 2024 |
| NO | `09` | Aust-Agder | Aust-Agder, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Agder (NO-42), and not yet the codes of 2024 |
| NO | `10` | Vest-Agder | Vest-Agder, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Agder (NO-42), and not yet the codes of 2024 |
| NO | `12` | Hordaland | Hordaland, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Vestland (NO-46), and not yet the codes of 2024 |
| NO | `14` | Sogn og Fjordane | Sogn og Fjordane, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Vestland (NO-46), and not yet the codes of 2024 |
| NO | `16` | Sør-Trøndelag | Sør-Trøndelag, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Trøndelag (NO-50), and not yet the codes of 2024 |
| NO | `17` | Nord-Trøndelag | Nord-Trøndelag, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Trøndelag (NO-50), and not yet the codes of 2024 |
| NO | `19` | Troms | Troms, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Troms og Finnmark (NO-54), and not yet the codes of 2024 |
| NO | `20` | Finnmark | Finnmark, a county before Norway's 2020 reform; kuni 1.0.0 has the counties of 2020 to 2023, where it is part of Troms og Finnmark (NO-54), and not yet the codes of 2024 |
| PH | `MAG` | Maguindanao | Maguindanao was split in 2022 into Maguindanao del Norte (PH-MGN) and del Sur (PH-MGS) |
| PH | `MNL` | Mandaluyong | Mandaluyong, a city of Metro Manila (PH-00), which ISO 3166-2 does not code on its own |
| PH | `SUN` | Surigao del Norte | Surigao del Norte as it was before 2006, with the Dinagat Islands (now PH-DIN) in it |
| RU | `X01~` | X01~ | a piece of the Yamal coast, 38 km², that Natural Earth draws without a name or a code |

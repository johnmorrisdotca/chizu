/*
 * ISO 3166-2 FOR THE REGIONS OF A COUNTRY. Natural Earth writes an ISO 3166-2 code on each of its regions; the build
 * keeps it when kuni has the same code, and this table answers for every region where it does not, keyed by the
 * country and the region's chizu code. `iso` is the code to use instead, or null with the reason there is none.
 * Where Natural Earth draws one ISO subdivision as several regions (County Dublin's four councils, a Northern Ireland
 * district from before 2015), each carries the code of the subdivision it lies in, and `why` says so: a test
 * holds every region to having a code or a line here, and every code two regions share to a line here.
 */
const NI_2015 = (code, name) => ({
  iso: `GB-${code}`,
  why: `a district of Northern Ireland before 2015, now part of ${name}`,
});
export const ISO_JOIN = {
  // Codes ISO 3166-2 has changed since Natural Earth wrote them.
  "FR:75": { iso: "FR-75C", why: "Paris has been FR-75C, the city as a collectivity, since 2019" },
  "MX:DIF": { iso: "MX-CMX", why: "the Distrito Federal has been Mexico City, MX-CMX, since 2016" },
  "TW:TPQ": { iso: "TW-NWT", why: "New Taipei has been TW-NWT since 2022" },
  "IT:AO": { iso: "IT-23", why: "the Aosta Valley has no provinces; IT-AO was withdrawn and the region is IT-23" },
  ...Object.fromEntries(
    Object.entries({
      DS: "02",
      KP: "04",
      LU: "06",
      LB: "08",
      LD: "10",
      MA: "12",
      MZ: "14",
      OP: "16",
      PK: "18",
      PD: "20",
      PM: "22",
      SL: "24",
      SK: "26",
      WN: "28",
      WP: "30",
      ZP: "32",
    }).map(([letters, number]) => [
      `PL:${letters}`,
      {
        iso: `PL-${number}`,
        why: `ISO 3166-2 numbered Poland's voivodeships in 2018 (PL-${letters} became PL-${number})`,
      },
    ]),
  ),
  // One ISO subdivision drawn as several regions: each lies in it.
  "IE:D": { iso: "IE-D", why: "Dublin City, one of the four councils of County Dublin (IE-D)" },
  "IE:D_2": { iso: "IE-D", why: "Dún Laoghaire–Rathdown, one of the four councils of County Dublin (IE-D)" },
  "IE:D_3": { iso: "IE-D", why: "Fingal, one of the four councils of County Dublin (IE-D)" },
  "IE:D_4": { iso: "IE-D", why: "South Dublin, one of the four councils of County Dublin (IE-D)" },
  "IE:CO": { iso: "IE-CO", why: "the county council's part of County Cork (IE-CO); the city's council is drawn apart" },
  "IE:CO_2": { iso: "IE-CO", why: "Cork City, drawn apart from the county it lies in (IE-CO)" },
  "IE:G": { iso: "IE-G", why: "the county council's part of County Galway (IE-G); the city's council is drawn apart" },
  "IE:G_2": { iso: "IE-G", why: "Galway City, drawn apart from the county it lies in (IE-G)" },
  "IE:LK": {
    iso: "IE-LK",
    why: "the county's part of County Limerick (IE-LK); the city, merged with it in 2014, is drawn apart",
  },
  "IE:LK_2": { iso: "IE-LK", why: "Limerick City, merged with the county (IE-LK) in 2014 and drawn apart" },
  "IE:WD": {
    iso: "IE-WD",
    why: "the county's part of County Waterford (IE-WD); the city, merged with it in 2014, is drawn apart",
  },
  "IE:WD_2": { iso: "IE-WD", why: "Waterford City, merged with the county (IE-WD) in 2014 and drawn apart" },
  "IE:TA": { iso: "IE-TA", why: "North Tipperary, merged with South Tipperary into County Tipperary (IE-TA) in 2014" },
  "IE:TA_2": {
    iso: "IE-TA",
    why: "South Tipperary, merged with North Tipperary into County Tipperary (IE-TA) in 2014",
  },
  "AU:NSW": {
    iso: "AU-NSW",
    why: "New South Wales, drawn without Lord Howe Island, which Natural Earth draws apart and which is part of it",
  },
  "AU:NSW_2": {
    iso: "AU-NSW",
    why: "Lord Howe Island, part of New South Wales (AU-NSW), drawn apart by Natural Earth",
  },
  "GB:ANT": NI_2015("ANN", "Antrim and Newtownabbey"),
  "GB:NTA": NI_2015("ANN", "Antrim and Newtownabbey"),
  "GB:ARD": NI_2015("AND", "Ards and North Down"),
  "GB:NDN": NI_2015("AND", "Ards and North Down"),
  "GB:ARM": NI_2015("ABC", "Armagh, Banbridge and Craigavon"),
  "GB:BNB": NI_2015("ABC", "Armagh, Banbridge and Craigavon"),
  "GB:CGV": NI_2015("ABC", "Armagh, Banbridge and Craigavon"),
  "GB:BLY": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:CLR": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:LMV": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:MYL": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:DRY": NI_2015("DRS", "Derry and Strabane"),
  "GB:STB": NI_2015("DRS", "Derry and Strabane"),
  "GB:FER": NI_2015("FMO", "Fermanagh and Omagh"),
  "GB:OMH": NI_2015("FMO", "Fermanagh and Omagh"),
  "GB:LSB": NI_2015("LBC", "Lisburn and Castlereagh"),
  "GB:CSR": NI_2015("LBC", "Lisburn and Castlereagh"),
  "GB:BLA": NI_2015("MEA", "Mid and East Antrim"),
  "GB:CKF": NI_2015("MEA", "Mid and East Antrim"),
  "GB:LRN": NI_2015("MEA", "Mid and East Antrim"),
  "GB:CKT": NI_2015("MUL", "Mid Ulster"),
  "GB:DGN": NI_2015("MUL", "Mid Ulster"),
  "GB:MFT": NI_2015("MUL", "Mid Ulster"),
  "GB:DOW": NI_2015("NMD", "Newry, Mourne and Down"),
  "GB:NYM": NI_2015("NMD", "Newry, Mourne and Down"),
  "GB:BMH": { iso: "GB-BCP", why: "Bournemouth, part of Bournemouth, Christchurch and Poole (GB-BCP) since 2019" },
  "GB:POL": { iso: "GB-BCP", why: "Poole, part of Bournemouth, Christchurch and Poole (GB-BCP) since 2019" },
  "IT:CI": { iso: "IT-SU", why: "Carbonia-Iglesias, abolished in 2016 and now part of Sud Sardegna (IT-SU)" },
  "IT:VS": { iso: "IT-SU", why: "Medio Campidano, abolished in 2016 and now part of Sud Sardegna (IT-SU)" },
  "IT:OT": { iso: "IT-SS", why: "Olbia-Tempio, abolished in 2016 and now part of Sassari (IT-SS)" },
  "IT:SS": { iso: "IT-SS", why: "Sassari as it was before 2016, when Olbia-Tempio joined it" },
  "IT:OG": { iso: "IT-NU", why: "Ogliastra, abolished in 2016 and now part of Nuoro (IT-NU)" },
  "IT:NU": { iso: "IT-NU", why: "Nuoro as it was before 2016, when Ogliastra joined it" },
  // Natural Earth's code belongs to another region of the same name.
  "CO:CUN": {
    iso: "CO-DC",
    why: "Bogotá, the Capital District (CO-DC); Natural Earth writes Cundinamarca's code on it",
  },
  "PE:LIM_2": {
    iso: "PE-LMA",
    why: "the Province of Lima (PE-LMA); Natural Earth writes the Lima Region's code on it",
  },
  // No code.
  "AU:X02~": { iso: null, why: "Jervis Bay Territory has no ISO 3166-2 code of its own" },
  "GB:NTH": {
    iso: null,
    why: "Northamptonshire was split in 2021 into North (GB-NNH) and West Northamptonshire (GB-WNH)",
  },
  "NO:X01~": {
    iso: null,
    why: "Bouvet Island is a country code of its own in ISO 3166-1 (BV), with no subdivision code",
  },
  // Norway's counties as Natural Earth draws them, from before the 2020 reform, in the counties of 2024 they lie in.
  ...Object.fromEntries(
    [
      ["01", "Østfold", "NO-31", "Østfold (NO-31), restored in 2024"],
      ["02", "Akershus", "NO-32", "Akershus (NO-32), restored in 2024 with Jevnaker and Lunner"],
      ["06", "Buskerud", "NO-33", "Buskerud (NO-33), restored in 2024 without Svelvik and Jevnaker"],
      ["04", "Hedmark", "NO-34", "Innlandet (NO-34), Hedmark and Oppland joined in 2020"],
      ["05", "Oppland", "NO-34", "Innlandet (NO-34), Hedmark and Oppland joined in 2020"],
      ["07", "Vestfold", "NO-39", "Vestfold (NO-39), restored in 2024"],
      ["08", "Telemark", "NO-40", "Telemark (NO-40), restored in 2024"],
      ["09", "Aust-Agder", "NO-42", "Agder (NO-42), Aust- and Vest-Agder joined in 2020"],
      ["10", "Vest-Agder", "NO-42", "Agder (NO-42), Aust- and Vest-Agder joined in 2020"],
      ["12", "Hordaland", "NO-46", "Vestland (NO-46), Hordaland and Sogn og Fjordane joined in 2020"],
      ["14", "Sogn og Fjordane", "NO-46", "Vestland (NO-46), Hordaland and Sogn og Fjordane joined in 2020"],
      ["16", "Sør-Trøndelag", "NO-50", "Trøndelag (NO-50), Sør- and Nord-Trøndelag joined in 2018"],
      ["17", "Nord-Trøndelag", "NO-50", "Trøndelag (NO-50), Sør- and Nord-Trøndelag joined in 2018"],
      ["19", "Troms", "NO-55", "Troms (NO-55), restored in 2024"],
      ["20", "Finnmark", "NO-56", "Finnmark (NO-56), restored in 2024"],
    ].map(([code, name, iso, now]) => [
      `NO:${code}`,
      { iso, why: `${name}, a county before Norway's 2020 reform, which lies in ${now}` },
    ]),
  ),
  "PH:MAG": {
    iso: null,
    why: "Maguindanao was split in 2022 into Maguindanao del Norte (PH-MGN) and del Sur (PH-MGS)",
  },
  "PH:MNL": {
    iso: null,
    why: "Mandaluyong, a city of Metro Manila (PH-00), which ISO 3166-2 does not code on its own",
  },
  "PH:SUN": { iso: null, why: "Surigao del Norte as it was before 2006, with the Dinagat Islands (now PH-DIN) in it" },
  "RU:X01~": {
    iso: null,
    why: "a piece of the Yamal coast, 38 km², that Natural Earth draws without a name or a code",
  },
};

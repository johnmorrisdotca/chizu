/*
 * THE WORLD IN 1990 (MODULES-1622): the world of 1 January 1990, as the dissolves of today's shapes. A former country's code
 * is its ISO 3166-3 code, as kuni and hata have it (`SUHH`, `YUCS`, `CSHH`, `DDDE`, `YDYE`); the two that have none keep
 * the alpha-2 code they held, `DE` for West Germany and `YE` for North Yemen, on the map where they are that country.
 */

/** The present-day countries (by this map's code) joined along their borders into one, drawn at 1:110m. */
export const JOINED = {
  SUHH: {
    from: ["AM", "AZ", "BY", "EE", "GE", "KZ", "KG", "LT", "LV", "MD", "RU", "TJ", "TM", "UA", "UZ"],
    name: "Soviet Union",
    nameJa: "ソビエト連邦",
    reading: "そびえとれんぽう",
    iso3: "SUN",
    group: "Europe",
  },
  YUCS: {
    from: ["BA", "HR", "ME", "MK", "RS", "SI", "XK"],
    name: "Yugoslavia",
    nameJa: "ユーゴスラビア",
    reading: "ユーゴスラビア",
    iso3: "YUG",
    group: "Europe",
  },
  CSHH: {
    from: ["CZ", "SK"],
    name: "Czechoslovakia",
    nameJa: "チェコスロバキア",
    reading: "チェコスロバキア",
    iso3: "CSK",
    group: "Europe",
  },
};

/**
 * The two countries drawn from the regions of today's (Natural Earth's 1:10m admin-1, by ISO 3166-2 code): Germany's states
 * in the east and in the west, and Yemen's governorates in the south and in the north, as they are today. Berlin is one
 * region, so it is drawn whole with the east, whose capital it was; West Berlin, a part of the city, is not drawn apart.
 * The governorates' lines of today are not those of 1990 to the last district (Al Bayda and Ad Dali were each partly
 * in the other state), so the border between the Yemens is approximate.
 */
export const SPLIT = {
  DE: {
    country: "DE",
    parts: {
      DDDE: {
        from: ["DE-BB", "DE-BE", "DE-MV", "DE-SN", "DE-ST", "DE-TH"],
        name: "East Germany",
        nameJa: "東ドイツ",
        reading: "ひがしどいつ",
        iso3: "DDR",
        neighbors: ["CSHH", "DE", "PL"],
      },
      DE: {
        rest: true,
        name: "West Germany",
        nameJa: "西ドイツ",
        reading: "にしどいつ",
        iso3: "DEU",
        neighbors: ["AT", "BE", "CH", "CSHH", "DDDE", "DK", "FR", "LU", "NL"],
      },
    },
    group: "Europe",
  },
  YE: {
    country: "YE",
    parts: {
      YDYE: {
        from: ["YE-AD", "YE-LA", "YE-AB", "YE-DA", "YE-SH", "YE-HD", "YE-MR"],
        name: "South Yemen",
        nameJa: "南イエメン",
        reading: "みなみいえめん",
        iso3: "YMD",
        neighbors: ["OM", "SA", "YE"],
      },
      YE: {
        rest: true,
        name: "North Yemen",
        nameJa: "北イエメン",
        reading: "きたいえめん",
        iso3: "YEM",
        neighbors: ["OM", "SA", "YDYE"],
      },
    },
    group: "Asia",
  },
};

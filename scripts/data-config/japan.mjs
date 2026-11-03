/*
 * JAPAN'S PREFECTURES, from Natural Earth's admin-1 file like every other country's regions, named from kuni.
 *
 * The eight regions (地方) a Japanese school teaches are kuni's grouping `jp-regions-8`, read at build time for
 * `group`: the look-alikes a quiz offers come from the same region first, and Okinawa is counted in Kyushu, as the
 * eight-region division counts it. A region's `group` is kuni's English name without its " region" (Kinki), its
 * `groupJa` kuni's Japanese (近畿地方), and its `groupAliases` the other names kuni gives it (Kansai region, 関西地方),
 * each with and without its 地方 or region, and its own name without 地方 (近畿), so a search finds it by any.
 */
export const JAPAN_GROUPING = "jp-regions-8";

/*
 * The larger parts of a country that its regions are grouped in, in English and Japanese, where Natural Earth's own
 * grouping is not the one people use. Canada's five regions, as Statistics Canada and every Canadian atlas name them,
 * in place of Natural Earth's three; the United States' four Census regions, which are Natural Earth's own, given
 * their Japanese names. By the region's chizu code.
 */
export const REGION_GROUPS = {
  CA: {
    names: {
      Atlantic: "大西洋沿岸諸州",
      Central: "中部カナダ",
      Prairies: "プレーリー諸州",
      "West Coast": "西海岸",
      North: "北部地域",
    },
    members: {
      NL: "Atlantic",
      PE: "Atlantic",
      NS: "Atlantic",
      NB: "Atlantic",
      QC: "Central",
      ON: "Central",
      MB: "Prairies",
      SK: "Prairies",
      AB: "Prairies",
      BC: "West Coast",
      YT: "North",
      NT: "North",
      NU: "North",
    },
  },
  US: {
    names: { Northeast: "北東部", Midwest: "中西部", South: "南部", West: "西部" },
  },
};

/*
 * Natural Earth 5.1.2 draws the Amami Islands (Amami Ōshima, Kikai, Tokunoshima, Okinoerabu, Yoron) inside Okinawa;
 * they are Kagoshima's. A piece of Okinawa east of this longitude and north of this latitude is moved to Kagoshima.
 * Iheya and Izena (127.9°E) and Iōtorishima (128.2°E), north of 27° but Okinawa's, stay where they are.
 */
export const AMAMI = { eastOf: 128.3, northOf: 27 };

/*
 * The mainland a map of Japan is framed to, and what goes in boxes. Okinawa is drawn in a box of its own; Kagoshima's
 * islands south of Yakushima (the Tokara and Amami Islands) and Tokyo's south of Torishima (the Ogasawara and Volcano
 * Islands and Minamitorishima) are drawn in boxes of theirs, the rest of each prefecture where it is: the way a
 * Japanese school atlas draws the country on one page.
 */
export const JAPAN_OUTLYING = {
  /** Kagoshima's pieces whose northern edge is south of this are its outlying islands. Yakushima's is 30.47°N, the Tokara Islands' at most 30.00°N. */
  kagoshimaSouthOf: 30.2,
  /** Tokyo's: Torishima reaches 30.49°N, the Ogasawara Islands 27.73°N. */
  tokyoSouthOf: 29,
};

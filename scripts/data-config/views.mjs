/*
 * POINTS OF VIEW. Natural Earth draws de facto lines (who controls a place today) and says so; for the places it
 * is asked about it also publishes a file for each country's own point of view. chizu reads two of them, as the
 * sources the party of each view is: Ukraine's (Crimea and Sevastopol in Ukraine, as the UN General Assembly's
 * resolution 68/262 and ISO 3166 have them) and Japan's (the Northern Territories in Japan, as Japan's government
 * has them).
 *
 * A point-of-view file is not the default file with one change (it is made from another vintage of Natural Earth
 * and differs in a hundred small ways), so a view is not drawn from it. It is used only to say which pieces of
 * the default outline of `from` belong to `to` in that view: the default piece whose centre lies inside the
 * point-of-view outline of `to`. Those pieces move, as the default's own lines, so nothing else about the map
 * changes, at any scale (a piece too small for a scale is not there to move: the Kuril islands at 1:110m).
 */

/** Where the point-of-view files are read from: Natural Earth's own repository at the tag the other files use, each held to its SHA-256. */
export const VIEW_FILES = {
  "ne_10m_admin_0_countries_ukr.geojson": "28a1a17d7327cad576083d5122b867843f957468b1bb11168ded23fd5aea342e",
  "ne_10m_admin_0_countries_jpn.geojson": "11bc047064a5cf2db03efc2aece341e657df2dd59ad715a8221cc1575697df1b",
};

/**
 * Each view: the file its party's outline is read from, the country the pieces leave (`from`) and the one they join
 * (`to`), how many pieces it must find at 1:110m and 1:50m (the scales the world and the country maps are drawn from) (so a changed file or a changed rule stops the
 * build), the region codes it takes off the maps of a country's regions, and the words a page shows.
 */
export const VIEWS = {
  ukr: {
    file: "ne_10m_admin_0_countries_ukr.geojson",
    from: "RU",
    to: "UA",
    pieces: { "110m": 1, "50m": 1 },
    removeFrom: { "divisions-ru": ["UA-40", "UA-43"] },
    name: "Ukraine's point of view",
    nameJa: "ウクライナの立場",
    note: "Crimea and Sevastopol are drawn in Ukraine, as the UN General Assembly (resolution 68/262) and ISO 3166 have them. The default drawing follows Natural Earth's de facto lines, which put them in Russia. The Russian regions map drops its two entries for them.",
    noteJa:
      "クリミアとセヴァストポリは、国連総会決議68/262とISO 3166のとおり、ウクライナの領土として描きます。標準の描き方は、いま実際に支配している国に基づくNatural Earthの線で、この2つはロシア側に描かれます。ロシアの行政区画の地図からは、この2つの地域が除かれます。",
  },
  jpn: {
    file: "ne_10m_admin_0_countries_jpn.geojson",
    from: "RU",
    to: "JP",
    pieces: { "110m": 0, "50m": 3 },
    removeFrom: {},
    name: "Japan's point of view",
    nameJa: "日本の立場",
    note: "The Northern Territories (Etorofu, Kunashiri, Shikotan and the Habomai islets) are drawn in Japan, as Japan's government has them. The default drawing follows Natural Earth's de facto lines, which put them in Russia. They are too small for the 1:110m world, which is unchanged: the finer world and Japan's own map show them. The regions maps are unchanged.",
    noteJa:
      "北方領土（択捉島、国後島、色丹島、歯舞群島）は、日本政府の立場のとおり、日本の領土として描きます。標準の描き方は、いま実際に支配している国に基づくNatural Earthの線で、ロシア側に描かれます。最も粗い世界地図（1:110m）では島が小さすぎて描けないため、世界地図は変わりません。細かい世界地図と日本の地図には表示されます。行政区画の地図は変わりません。",
  },
};

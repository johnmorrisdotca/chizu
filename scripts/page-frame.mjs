// The words of the family's page frame on chizu's demo pages (kazoku-ui's page-frame), in one place: what each page is, in
// English and Japanese, and the data's credit line with the link to NOTICE.md. scripts/site.mjs writes them into the
// pages; the tests read the same table.

/** Where every credit is written in full. */
export const NOTICE = "https://github.com/johnmorrisdotca/chizu/blob/main/NOTICE.md";

export const INDEX_DESCRIPTION =
  "Japan's 47 prefectures, the world, its continents and 32 countries' regions, with their seas, lakes, rivers and mountains: pan and zoom, play and share geography quizzes, print numbered callout sheets, and colour a map from your own figures. Natural Earth outlines, names in English and Japanese. Free and open source.";
export const BUILDER_DESCRIPTION = "Preview an embeddable map, named place or geography quiz and copy the code.";

/** What each page is: its header line, its title and its description, in both languages. */
export const FRAME_TEXTS = {
  "index.html": {
    en: { name: "Chizu 地図", what: "maps to explore, quiz and colour", description: INDEX_DESCRIPTION },
    ja: {
      name: "地図 Chizu",
      what: "見て、クイズをして、色を塗る地図",
      description:
        "日本の47都道府県、世界、大陸、32か国の地方と、その海、湖、川、山。ドラッグして拡大縮小できる地図、遊んで共有できるクイズ、印刷できる番号つきの地図、自分の数値で色を塗った地図です。輪郭はNatural Earthのもので、名前は英語と日本語です。無料のオープンソースです。",
    },
  },
  "builder.html": {
    en: { name: "Chizu 地図", what: "embed builder", description: BUILDER_DESCRIPTION },
    ja: {
      name: "地図 Chizu",
      what: "埋め込みコードを作る",
      description: "埋め込む地図、場所の表示、地理のクイズをプレビューして、コードをコピーできます。",
    },
  },
};

/** The data's credit line on every page: the outlines and the features' names are Natural Earth's; the countries' names kuni's and Wikidata's. */
export const FRAME_CREDITS = {
  en: "Outlines and feature names from Natural Earth (public domain); country names from kuni (Unicode CLDR) and Wikidata.",
  ja: "輪郭と地物の名前はNatural Earth（パブリックドメイン）、国名はkuni（Unicode CLDR）とWikidataのものです。",
};

/** The small credit line in the corner of an embed page. */
export const EMBED_CREDITS = {
  en: "Map: Natural Earth, kuni and Wikidata",
  ja: "地図：Natural Earth、kuni、Wikidata",
};

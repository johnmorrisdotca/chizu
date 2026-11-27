import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** The guide on disputed areas names every region that carries the flag, in both languages, and the notes a page shows are the data's own. */
describe("the guide on disputed areas", () => {
  for (const [name, path] of [
    ["in English", "docs/guides/disputed-areas.md"],
    ["in Japanese", "docs/guides/ja/disputed-areas.md"],
  ])
    it(`names the eight regions that are flagged, ${name}, and carries no ticket id`, () => {
      const guide = readFileSync(path, "utf8");
      for (const code of ["XK", "TW", "EH", "UA-43", "UA-40", "AR", "JK", "LA"])
        expect(guide, code).toContain(`\`${code}\``);
      expect(guide).not.toMatch(/MODULES-\d+/);
    });
});

/**
 * Every place has a section of its own, with a line for each party to the dispute (the governments, the authorities that
 * hold the place and the UN where it has spoken), each side's own name for the place in its own script, and a source for
 * each position that is named in the list at the end.
 */
const PLACES = [
  {
    en: "Crimea and Sevastopol",
    ja: "クリミアとセヴァストポリ",
    parties: [
      ["Russia", "ロシア"],
      ["Ukraine", "ウクライナ"],
      ["General Assembly", "国連総会"],
      ["ISO 3166", "ISO 3166"],
    ],
    names: ["Крым", "Крим", "Севастополь"],
  },
  {
    en: "Northern Territories",
    ja: "北方領土",
    parties: [
      ["Russia", "ロシア"],
      ["Japan", "日本"],
    ],
    names: ["北方領土", "Южные Курилы", "択捉島", "Итуруп", "Кунашир", "Шикотан", "Хабомаи"],
  },
  {
    en: "Senkaku Islands",
    ja: "尖閣諸島",
    parties: [
      ["Japan", "日本"],
      ["China", "中国"],
      ["Taiwan", "台湾"],
      ["United States", "アメリカ"],
    ],
    names: ["尖閣諸島", "釣魚臺"],
    namesEn: ["钓鱼岛"],
    namesJa: ["釣魚島"],
  },
  {
    en: "Takeshima",
    ja: "竹島",
    parties: [
      ["Korea", "韓国"],
      ["Japan", "日本"],
    ],
    names: ["竹島", "독도", "Dokdo"],
  },
  {
    en: "Taiwan",
    ja: "台湾",
    parties: [
      ["Taiwan", "台湾"],
      ["China", "中国"],
      ["General Assembly", "国連総会"],
      ["ISO 3166", "ISO 3166"],
    ],
    names: ["臺灣", "中華民國"],
  },
  {
    en: "Abkhazia and South Ossetia",
    ja: "アブハジアと南オセチア",
    parties: [
      ["Georgia", "ジョージア"],
      ["Russia", "ロシア"],
      ["Abkhazia", "アブハジア"],
      ["South Ossetia", "南オセチア"],
      ["Security Council", "安全保障理事会"],
    ],
    names: ["Аҧсны", "აფხაზეთი", "Хуссар Ирыстон", "ცხინვალის"],
  },
  {
    en: "Transnistria",
    ja: "沿ドニエストル",
    parties: [
      ["Moldova", "モルドバ"],
      ["Russia", "ロシア"],
      ["Transnistria", "沿ドニエストル"],
      ["General Assembly", "国連総会"],
    ],
    names: ["Приднестровская Молдавская Республика", "Stânga Nistrului"],
  },
  {
    en: "Kashmir",
    ja: "カシミール",
    parties: [
      ["China", "中国"],
      ["India", "インド"],
      ["Pakistan", "パキスタン"],
      ["Security Council", "安全保障理事会"],
    ],
    names: ["जम्मू और कश्मीर", "آزاد جموں و کشمیر", "克什米尔"],
  },
  {
    en: "Aksai Chin",
    ja: "アクサイチン",
    parties: [
      ["China", "中国"],
      ["India", "インド"],
    ],
    names: ["阿克赛钦", "अक्साई चिन"],
  },
  {
    en: "Arunachal Pradesh",
    ja: "アルナーチャル・プラデーシュ州",
    parties: [
      ["India", "インド"],
      ["China", "中国"],
    ],
    names: ["अरुणाचल प्रदेश", "藏南"],
  },
  {
    en: "Golan Heights",
    ja: "ゴラン高原",
    parties: [
      ["Israel", "イスラエル"],
      ["Syria", "シリア"],
      ["Security Council", "安全保障理事会"],
      ["United States", "アメリカ"],
    ],
    names: ["רמת הגולן", "الجولان"],
  },
  {
    en: "Western Sahara",
    ja: "西サハラ",
    parties: [
      ["Morocco", "モロッコ"],
      ["Polisario", "ポリサリオ"],
      ["United Nations", "国連"],
    ],
    names: ["الصحراء المغربية", "الصحراء الغربية", "Sáhara Occidental"],
  },
  {
    en: "Northern Cyprus",
    ja: "北キプロス",
    parties: [
      ["Republic of Cyprus", "キプロス共和国"],
      ["Turkey", "トルコ"],
      ["Turkish Cypriot", "トルコ系キプロス"],
      ["Security Council", "安全保障理事会"],
    ],
    names: ["Κυπριακή Δημοκρατία", "κατεχόμενα", "Kuzey Kıbrıs Türk Cumhuriyeti"],
  },
  {
    en: "Somaliland",
    ja: "ソマリランド",
    parties: [
      ["Somalia", "ソマリア"],
      ["Somaliland", "ソマリランド"],
      ["African Union", "アフリカ連合"],
      ["Israel", "イスラエル"],
      ["Ethiopia", "エチオピア"],
      ["United Nations", "国連"],
    ],
    names: ["Soomaaliland", "أرض الصومال", "Soomaaliya"],
  },
  {
    en: "Kosovo",
    ja: "コソボ",
    parties: [
      ["Kosovo", "コソボ"],
      ["Serbia", "セルビア"],
      ["Russia", "ロシア"],
      ["China", "中国"],
      ["Security Council", "安全保障理事会"],
    ],
    names: ["Kosova", "Косово и Метохија"],
  },
];

/** The guide cut into its "###" sections by heading, the text before its list of sources, and that list. */
const read = (path) => {
  const guide = readFileSync(path, "utf8");
  const at = guide.search(/\n## (Sources|出典)\n/);
  const body = at < 0 ? guide : guide.slice(0, at);
  const sources = at < 0 ? "" : guide.slice(at);
  const sections = new Map();
  for (const part of body.split(/\n### /).slice(1)) {
    const [heading, ...rest] = part.split("\n");
    sections.set(heading.trim(), rest.join("\n").split(/\n## /)[0]);
  }
  return { guide, body, sections, sources };
};

describe("the guide on disputed areas: each party, each side's name and each source", () => {
  for (const [language, path, key] of [
    ["English", "docs/guides/disputed-areas.md", "en"],
    ["Japanese", "docs/guides/ja/disputed-areas.md", "ja"],
  ]) {
    const { guide, body, sections, sources } = read(path);
    const index = key === "en" ? 0 : 1;

    it(`${language}: has a section for each of the fifteen places`, () => {
      expect([...sections.keys()]).toEqual(PLACES.map((place) => place[key]));
    });

    for (const place of PLACES)
      it(`${language}: ${place.en} gives every party's position and every side's name, with sources`, () => {
        const section = sections.get(place[key]) ?? "";
        expect(section.length, "the section").toBeGreaterThan(0);
        for (const party of place.parties) expect(section, `party ${party[index]}`).toContain(party[index]);
        for (const name of [...place.names, ...(place[key === "en" ? "namesEn" : "namesJa"] ?? [])])
          expect(section, `name ${name}`).toContain(name);
        // a position is a list item: its party in bold, one line, the sources it rests on
        const rows = section.split("\n").filter((line) => /^- \*\*.+\*\*.*\[S\d+\]/.test(line));
        expect(rows.length, "rows with a source").toBeGreaterThanOrEqual(place.parties.length);
        expect(section).toMatch(key === "en" ? /\*\*Names:\*\*/ : /\*\*名称：\*\*/);
      });

    it(`${language}: names each source at the end, and every source used is named`, () => {
      const named = new Set([...sources.matchAll(/^- \*\*S(\d+)\*\*/gm)].map((match) => match[1]));
      const used = new Set([...body.matchAll(/\[S(\d+)\]/g)].map((match) => match[1]));
      expect(named.size).toBeGreaterThan(30);
      expect([...used].filter((id) => !named.has(id))).toEqual([]);
      expect([...named].filter((id) => !used.has(id))).toEqual([]);
    });

    it(`${language}: says which name comes first and why, and that the order is not a preference`, () => {
      expect(guide).toMatch(key === "en" ? /comes first/ : /先に書きます/);
      expect(guide).toMatch(key === "en" ? /not a preference/ : /好みによるものではありません/);
    });
  }

  it("says in both languages that Somaliland and Northern Cyprus are drawn with Somalia (`SO`) and Cyprus (`CY`)", () => {
    for (const path of ["docs/guides/disputed-areas.md", "docs/guides/ja/disputed-areas.md"]) {
      const { sections } = read(path);
      const keys = [...sections.keys()];
      const so = sections.get(keys.find((key) => /Somaliland|ソマリランド/.test(key)) ?? "") ?? "";
      const cy = sections.get(keys.find((key) => /Northern Cyprus|北キプロス/.test(key)) ?? "") ?? "";
      expect(so, path).toContain("`SO`");
      expect(cy, path).toContain("`CY`");
    }
  });
});

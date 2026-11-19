/*
 * VIETNAM'S 34 PROVINCES AND CITIES. Resolution 202/2025/QH15 of the National Assembly, passed on 2025-06-12 (Official
 * Gazette, Công báo, issue 773+774 of 2025-06-23; signed text https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/6/202qh.signed.pdf),
 * merged the 63 provinces and cities into 34, whose governments began work on 2025-07-01. Each clause of its Article 1
 * merges the whole area of the units it names, so the build dissolves Natural Earth's 63 into the 34 along Natural
 * Earth's own lines, as a map of its own, `divisions/vn-2025`; `divisions/vn` stays the 63 until the next major
 * version. The old provinces are matched on their ISO 3166-2 code, never their name: Natural Earth names
 * VN-39, VN-53 and VN-66 after regions (Đông Nam Bộ, Đông Bắc, Đồng Bằng Sông Hồng), not the provinces they are.
 *
 * ISO 3166-2:VN still lists the 63, so a merged unit has no ISO code yet (`iso` is left off, with the reason in
 * ISO_JOIN, keyed `VN-2025`) and is not given one here. Its chizu `code` is the code of the old province whose name it took (every
 * merged unit is named after one of the provinces in it): Tuyên Quang is `07`, Hồ Chí Minh City `SG`. The 11 that
 * were not merged keep their code and their ISO code. `name` and `nameJa` are kuni's for the province named, the
 * names the new unit kept; `from` is each old province's code and name.
 */
export const VIETNAM_2025 = {
  note: "dissolved into the 34 provinces and cities of Resolution 202/2025/QH15 (in force 2025-07-01)",
  /** The 11 the Resolution left as they were (Article 1, clause 24). */
  unchanged: ["HN", "26", "01", "71", "05", "09", "13", "21", "22", "23", "04"],
  /** The 23 it made, in the order of Article 1, clauses 1 to 23. */
  merged: [
    {
      code: "07",
      name: "Tuyên Quang",
      nameJa: "トゥエンクアン省",
      from: [
        ["03", "Hà Giang"],
        ["07", "Tuyên Quang"],
      ],
    },
    {
      code: "02",
      name: "Lào Cai",
      nameJa: "ラオカイ省",
      from: [
        ["06", "Yên Bái"],
        ["02", "Lào Cai"],
      ],
    },
    {
      code: "69",
      name: "Thái Nguyên",
      nameJa: "タイグエン省",
      from: [
        ["53", "Bắc Kạn"],
        ["69", "Thái Nguyên"],
      ],
    },
    {
      code: "68",
      name: "Phú Thọ",
      nameJa: "フート省",
      from: [
        ["70", "Vĩnh Phúc"],
        ["14", "Hòa Bình"],
        ["68", "Phú Thọ"],
      ],
    },
    {
      code: "56",
      name: "Bắc Ninh",
      nameJa: "バクニン省",
      from: [
        ["54", "Bắc Giang"],
        ["56", "Bắc Ninh"],
      ],
    },
    {
      code: "66",
      name: "Hưng Yên",
      nameJa: "フンイエン省",
      from: [
        ["20", "Thái Bình"],
        ["66", "Hưng Yên"],
      ],
    },
    {
      code: "HP",
      name: "Haiphong",
      nameJa: "ハイフォン",
      from: [
        ["HP", "Haiphong"],
        ["61", "Hải Dương"],
      ],
    },
    {
      code: "18",
      name: "Ninh Bình",
      nameJa: "ニンビン省",
      from: [
        ["63", "Hà Nam"],
        ["67", "Nam Định"],
        ["18", "Ninh Bình"],
      ],
    },
    {
      code: "25",
      name: "Quảng Trị",
      nameJa: "クアンチ省",
      from: [
        ["24", "Quảng Bình"],
        ["25", "Quảng Trị"],
      ],
    },
    {
      code: "DN",
      name: "Da Nang",
      nameJa: "ダナン",
      from: [
        ["DN", "Da Nang"],
        ["27", "Quảng Nam"],
      ],
    },
    {
      code: "29",
      name: "Quảng Ngãi",
      nameJa: "クアンガイ省",
      from: [
        ["28", "Kon Tum"],
        ["29", "Quảng Ngãi"],
      ],
    },
    {
      code: "30",
      name: "Gia Lai",
      nameJa: "ザライ省",
      from: [
        ["31", "Bình Định"],
        ["30", "Gia Lai"],
      ],
    },
    {
      code: "34",
      name: "Khánh Hòa",
      nameJa: "カインホア省",
      from: [
        ["36", "Ninh Thuận"],
        ["34", "Khánh Hòa"],
      ],
    },
    {
      code: "35",
      name: "Lâm Đồng",
      nameJa: "ラムドン省",
      from: [
        ["72", "Đắk Nông"],
        ["40", "Bình Thuận"],
        ["35", "Lâm Đồng"],
      ],
    },
    {
      code: "33",
      name: "Đắk Lắk",
      nameJa: "ダクラク省",
      from: [
        ["32", "Phú Yên"],
        ["33", "Đắk Lắk"],
      ],
    },
    {
      code: "SG",
      name: "Ho Chi Minh City",
      nameJa: "ホーチミン市",
      from: [
        ["SG", "Ho Chi Minh City"],
        ["43", "Bà Rịa–Vũng Tàu"],
        ["57", "Bình Dương"],
      ],
    },
    {
      code: "39",
      name: "Đồng Nai",
      nameJa: "ドンナイ省",
      from: [
        ["58", "Bình Phước"],
        ["39", "Đồng Nai"],
      ],
    },
    {
      code: "37",
      name: "Tây Ninh",
      nameJa: "タイニン省",
      from: [
        ["41", "Long An"],
        ["37", "Tây Ninh"],
      ],
    },
    {
      code: "CT",
      name: "Cần Thơ",
      nameJa: "カントー",
      from: [
        ["CT", "Cần Thơ"],
        ["52", "Sóc Trăng"],
        ["73", "Hậu Giang"],
      ],
    },
    {
      code: "49",
      name: "Vĩnh Long",
      nameJa: "ヴィンロン省",
      from: [
        ["50", "Bến Tre"],
        ["51", "Trà Vinh"],
        ["49", "Vĩnh Long"],
      ],
    },
    {
      code: "45",
      name: "Đồng Tháp",
      nameJa: "ドンタップ省",
      from: [
        ["46", "Tiền Giang"],
        ["45", "Đồng Tháp"],
      ],
    },
    {
      code: "59",
      name: "Cà Mau",
      nameJa: "カマウ省",
      from: [
        ["55", "Bạc Liêu"],
        ["59", "Cà Mau"],
      ],
    },
    {
      code: "44",
      name: "An Giang",
      nameJa: "アンザン省",
      from: [
        ["47", "Kiên Giang"],
        ["44", "An Giang"],
      ],
    },
  ],
  /** The 6 of the 34 that are cities (thành phố); the other 28 are provinces (tỉnh). Huế has been a city since 2025-01-01 (Resolution 175/2024/QH15). */
  cities: ["HN", "26", "HP", "DN", "SG", "CT"],
};

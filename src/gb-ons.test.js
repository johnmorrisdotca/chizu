import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { ONS } from "../scripts/data-config.mjs";
import { CHIZU_SOURCE } from "./data/countries.data.ts";
import { loadDivisionsGeo } from "./divisions-geo-entry.ts";
import { DIVISIONS_CODES, loadDivisions } from "./load-entry.ts";

/*
 * The United Kingdom's two maps of regions. `gb` is Natural Earth's, exactly as in chizu 1.14.0, until the next major
 * release. `gb-2025` has England's, Scotland's and Wales's councils from the ONS's "Counties and Unitary Authorities
 * (December 2025) Boundaries UK BGC", and Northern Ireland's 26 districts of before 2015 from Natural Earth, as on
 * `gb` (scripts/data-config/ons.mjs).
 */
const BRITAIN = new Set(["England", "Scotland", "Wales"]);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

describe("the United Kingdom's map gb", () => {
  it("is the one of 1.14.0: its regions, the same in degrees, and its features (the Croydon seat marker moved 0.6 px with kuni 1.17.2's coordinates, MODULES-1858)", () => {
    const hashes = {
      "divisions/gb.data.ts": "9b50cfb21a14ed89e7ec697556e9eef5ee9ffc920b8290d2a95d7147eca377db",
      "divisions-geo/gb.data.ts": "6d5a1ea0dbfc81f89b3e0a7827564b92c90890d23677f48843c7fae4c1cfc004",
      "features/divisions-gb.data.ts": "50c8d9c0c392a84faf8717f9380d9fd2df1486e9099788e3bc6a56ef365d9563",
    };
    for (const [file, hash] of Object.entries(hashes))
      expect(sha256(readFileSync(new URL(`./data/${file}`, import.meta.url))), file).toBe(hash);
  });
});

describe("the United Kingdom's map gb-2025", () => {
  it("is loaded by its id, beside gb", async () => {
    expect(DIVISIONS_CODES).toContain("GB");
    expect(DIVISIONS_CODES).toContain("GB-2025");
    const map = await loadDivisions("gb-2025");
    expect(map.id).toBe("divisions-gb-2025");
    expect((await loadDivisions("GB-2025")).id).toBe("divisions-gb-2025");
    expect((await loadDivisionsGeo("gb-2025")).features.length).toBe(map.regions.length);
  });

  it("has the ONS's 218 councils but Northern Ireland's 11, and Natural Earth's 26 districts of Northern Ireland", async () => {
    const map = await loadDivisions("gb-2025");
    const count = (group) => map.regions.filter((region) => region.group === group).length;
    // The ONS's file: 63 unitary authorities, 36 metropolitan districts, 33 London boroughs and 21 counties in England, 32 council areas in Scotland, 22 in Wales, 11 districts in Northern Ireland.
    expect([count("England"), count("Scotland"), count("Wales")]).toEqual([63 + 36 + 33 + 21, 32, 22]);
    expect(map.regions.filter((region) => BRITAIN.has(region.group)).length).toBe(218 - 11);
    expect(count("Northern Ireland")).toBe(26);
    expect(map.regions.length).toBe(207 + 26);
    expect((await loadDivisionsGeo("GB-2025")).features.length).toBe(207 + 26);
  });

  it("has the councils of the reforms of 2019 to 2023, and not the ones they replaced", async () => {
    const map = await loadDivisions("gb-2025");
    const geo = await loadDivisionsGeo("GB-2025");
    const reformed = [
      "Westmorland and Furness",
      "Cumberland",
      "North Northamptonshire",
      "West Northamptonshire",
      "North Yorkshire",
      "Somerset",
      "Bournemouth, Christchurch and Poole",
      "Dorset",
      "Buckinghamshire",
    ];
    for (const name of reformed) {
      const region = map.regions.find((one) => one.name === name);
      expect(region?.type, name).toBe("unitary authority");
      expect(
        geo.features.some((feature) => feature.properties.code === region.code),
        name,
      ).toBe(true);
    }
    for (const gone of ["Cumbria", "Northamptonshire", "Bournemouth", "Poole"])
      expect(
        map.regions.find((region) => region.name === gone),
        gone,
      ).toBeUndefined();
  });

  it("keeps no region of Natural Earth's in England, Scotland or Wales", async () => {
    const map = await loadDivisions("gb-2025");
    // The ONS's kinds of council (ONS_TYPES), none of Natural Earth's ("administrative county", "unitary district", "london borough (royal)", …).
    const kinds = new Set(["unitary authority", "metropolitan district", "london borough", "county", "council area"]);
    const britain = map.regions.filter((region) => BRITAIN.has(region.group));
    expect(britain.filter((region) => !kinds.has(region.type)).map((region) => region.code)).toEqual([]);
    for (const code of ["NTH", "CMA", "BMH", "POL"])
      expect(map.regions.some((region) => region.code === code)).toBe(false);
    for (const source of [map.source, (await loadDivisionsGeo("GB-2025")).source]) {
      expect(source).toContain("Counties and Unitary Authorities (December 2025) Boundaries UK BGC");
      expect(source).toContain(
        "Source: Office for National Statistics licensed under the Open Government Licence v.3.0",
      );
      expect(source).toContain("Contains OS data © Crown copyright and database right 2025");
      expect(source).toContain("for Northern Ireland");
    }
  });

  it("gives the two councils ISO 3166-2 has not coded their ONS codes, and every other one its ISO code", async () => {
    const map = await loadDivisions("gb-2025");
    const britain = map.regions.filter((region) => BRITAIN.has(region.group));
    expect(britain.filter((region) => !region.iso).map((region) => `${region.code} ${region.name}`)).toEqual([
      "E06000063 Cumberland",
      "E06000064 Westmorland and Furness",
    ]);
    expect(new Set(britain.map((region) => region.iso).filter(Boolean)).size).toBe(207 - 2);
  });

  it("says where it comes from in NOTICE.md: the ONS's file, its SHA-256 and the query it was fetched with, and its two lines of attribution", () => {
    const notice = readFileSync("NOTICE.md", "utf8");
    for (const text of [ONS.name, ONS.sha256, ONS.query, ONS.portal, ...ONS.attribution])
      expect(notice).toContain(text);
    expect(notice).toContain("`divisions/gb-2025`");
    expect(notice).toContain("Northern Ireland");
    expect(notice).toContain("`CHIZU_SOURCE.ons.attribution`");
    expect(notice).toContain(ONS.licenceUrl);
  });

  it("names Natural Earth and the ONS on CHIZU_SOURCE, and quotes the Open Government Licence's lines", () => {
    expect(CHIZU_SOURCE.name).toBe("Natural Earth");
    expect(CHIZU_SOURCE.licence).toBe("Public domain");
    expect(CHIZU_SOURCE.ons).toEqual({
      name: "Office for National Statistics",
      nameJa: "英国国家統計局",
      product: ONS.name,
      licence: ONS.licence,
      licenceUrl: ONS.licenceUrl,
      attribution: [...ONS.attribution],
    });
    const line = ONS.attribution[0];
    const read = (path) => readFileSync(path, "utf8");
    for (const path of ["README.md", "docs/guides/loading-maps.md", "docs/guides/ja/loading-maps.md"]) {
      const text = read(path);
      expect(text, path).toContain("CHIZU_SOURCE.ons");
      expect(text, path).toContain(line);
    }
    expect(read("docs/guides/ja/loading-maps.md")).toContain(CHIZU_SOURCE.ons.nameJa);
    expect(read("docs/guides/loading-maps.md")).toContain(ONS.attribution[1]);
  });

  it("draws Northern Ireland as gb does: the same regions, and the same outlines in degrees, point for point", async () => {
    const [old, map] = [await loadDivisions("gb"), await loadDivisions("gb-2025")];
    const fields = (one) =>
      one.regions
        .filter((region) => region.group === "Northern Ireland")
        .map(({ code, iso, name, nameJa, group, type, neighbors }) => ({
          code,
          iso,
          name,
          nameJa,
          group,
          type,
          neighbors,
        }));
    expect(
      fields(map)
        .map((region) => region.code)
        .join(" "),
    ).toBe("ANT ARD ARM BFS BLA BLY BNB CGV CKF CKT CLR CSR DGN DOW DRY FER LMV LRN LSB MFT MYL NDN NTA NYM OMH STB");
    expect(fields(map)).toEqual(fields(old));
    const codes = new Set(fields(old).map((region) => region.code));
    const inDegrees = async (id) =>
      (await loadDivisionsGeo(id)).features.filter((feature) => codes.has(feature.properties.code));
    expect(await inDegrees("gb-2025")).toEqual(await inDegrees("gb"));
  });
});

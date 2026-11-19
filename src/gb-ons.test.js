import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { ONS } from "../scripts/data-config.mjs";
import { DIVISIONS_LOADERS } from "./data/loaders.data.ts";
import { loadDivisionsGeo } from "./divisions-geo-entry.ts";

/*
 * The United Kingdom's regions: England's, Scotland's and Wales's councils from the ONS's "Counties and Unitary
 * Authorities (December 2025) Boundaries UK BGC", and Northern Ireland's 26 districts of before 2015 from Natural
 * Earth, as they were in chizu 1.14.0 (scripts/data-config/ons.mjs).
 */
const gb = async () => (await DIVISIONS_LOADERS.gb()).default;
const BRITAIN = new Set(["England", "Scotland", "Wales"]);
const sha256 = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

describe("the United Kingdom's regions", () => {
  it("are the ONS's 218 councils but Northern Ireland's 11, and Natural Earth's 26 districts of Northern Ireland", async () => {
    const map = await gb();
    const count = (group) => map.regions.filter((region) => region.group === group).length;
    // The ONS's file: 63 unitary authorities, 36 metropolitan districts, 33 London boroughs and 21 counties in England, 32 council areas in Scotland, 22 in Wales, 11 districts in Northern Ireland.
    expect([count("England"), count("Scotland"), count("Wales")]).toEqual([63 + 36 + 33 + 21, 32, 22]);
    expect(map.regions.filter((region) => BRITAIN.has(region.group)).length).toBe(218 - 11);
    expect(count("Northern Ireland")).toBe(26);
    expect(map.regions.length).toBe(207 + 26);
    expect((await loadDivisionsGeo("GB")).features.length).toBe(207 + 26);
  });

  it("have the councils of the reforms of 2019 to 2023, and not the ones they replaced", async () => {
    const map = await gb();
    const geo = await loadDivisionsGeo("GB");
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

  it("keep no region of Natural Earth's in England, Scotland or Wales", async () => {
    const map = await gb();
    // The ONS's kinds of council (ONS_TYPES), none of Natural Earth's ("administrative county", "unitary district", "london borough (royal)", …).
    const kinds = new Set(["unitary authority", "metropolitan district", "london borough", "county", "council area"]);
    const britain = map.regions.filter((region) => BRITAIN.has(region.group));
    expect(britain.filter((region) => !kinds.has(region.type)).map((region) => region.code)).toEqual([]);
    for (const code of ["NTH", "CMA", "BMH", "POL"])
      expect(map.regions.some((region) => region.code === code)).toBe(false);
    for (const source of [map.source, (await loadDivisionsGeo("GB")).source]) {
      expect(source).toContain("Counties and Unitary Authorities (December 2025) Boundaries UK BGC");
      expect(source).toContain(
        "Source: Office for National Statistics licensed under the Open Government Licence v.3.0",
      );
      expect(source).toContain("Contains OS data © Crown copyright and database right 2025");
      expect(source).toContain("for Northern Ireland");
    }
  });

  it("give the two councils ISO 3166-2 has not coded their ONS codes, and every other one its ISO code", async () => {
    const map = await gb();
    const britain = map.regions.filter((region) => BRITAIN.has(region.group));
    expect(britain.filter((region) => !region.iso).map((region) => `${region.code} ${region.name}`)).toEqual([
      "E06000063 Cumberland",
      "E06000064 Westmorland and Furness",
    ]);
    expect(new Set(britain.map((region) => region.iso).filter(Boolean)).size).toBe(207 - 2);
  });

  it("say where they come from in NOTICE.md: the ONS's file, its SHA-256 and the query it was fetched with, and its two lines of attribution", () => {
    const notice = readFileSync("NOTICE.md", "utf8");
    for (const text of [ONS.name, ONS.sha256, ONS.query, ONS.portal, ...ONS.attribution])
      expect(notice).toContain(text);
    expect(notice).toContain("Northern Ireland");
  });

  it("leave Northern Ireland as it was in 1.14.0", async () => {
    const map = await gb();
    const ni = map.regions
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
    expect(ni.map((region) => region.code).join(" ")).toBe(
      "ANT ARD ARM BFS BLA BLY BNB CGV CKF CKT CLR CSR DGN DOW DRY FER LMV LRN LSB MFT MYL NDN NTA NYM OMH STB",
    );
    // Their codes, names, kinds and neighbours; and their outlines in longitude and latitude, point for point.
    expect(sha256(ni)).toBe("109c26404961d9b10d2928d9d51ccf82c781f7d5bd404144df24f5c4116cd6db");
    const codes = new Set(ni.map((region) => region.code));
    const geo = (await loadDivisionsGeo("GB")).features.filter((feature) => codes.has(feature.properties.code));
    expect(sha256(geo)).toBe("aae4438995871fcac806c02710bb85036201c3cff0af4f2fcd83fd94ea48c6ef");
  });
});

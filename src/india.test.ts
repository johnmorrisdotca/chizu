import { describe, expect, it } from "vitest";
import { ISO_JOIN, TYPE_FIXES } from "../scripts/data-config.mjs";
import india from "./data/divisions/in.data.ts";
import { loadDivisionsGeo } from "./divisions-geo-entry.ts";
import { loadDivisions } from "./load-entry.ts";

const STATES = "AP AR AS BR CT GA GJ HP HR JH KA KL MH ML MN MP MZ NL OR PB RJ SK TG TN TR UP UT WB".split(" ");
const UNION_TERRITORIES = "AN CH DH DL JK LA LD PY".split(" ");
const byCode = (code: string) => india.regions.find((region) => region.code === code)!;
const isos = india.regions.map((region) => region.iso);

describe("India's states and union territories", () => {
  it("are 36 regions: 28 states and 8 union territories, as the official list has them", () => {
    expect(india.regions).toHaveLength(36);
    expect(india.regions.filter((region) => region.type === "state").map((region) => region.code)).toEqual(
      [...STATES].sort(),
    );
    expect(india.regions.filter((region) => region.type === "union territory").map((region) => region.code)).toEqual(
      [...UNION_TERRITORIES].sort(),
    );
    expect(india.regions.every((region) => region.type === "state" || region.type === "union territory")).toBe(true);
  });

  it("have Himachal Pradesh and Gujarat as states, which Natural Earth gets wrong and leaves empty", () => {
    expect(Object.keys(TYPE_FIXES).filter((key) => /^IN:/.test(key))).toEqual(["IN:HP", "IN:GJ"]);
    expect(byCode("HP").type).toBe("state");
    expect(byCode("GJ").type).toBe("state");
  });

  it("carry the ISO 3166-2 codes in force since 2023-11-23, and none of the four it replaced", () => {
    for (const code of ["IN-OD", "IN-CG", "IN-TS", "IN-UK"]) expect(isos, code).toContain(code);
    for (const code of ["IN-OR", "IN-CT", "IN-TG", "IN-UT"]) expect(isos, code).not.toContain(code);
    expect(byCode("OR").iso).toBe("IN-OD");
    expect(byCode("CT").iso).toBe("IN-CG");
    expect(byCode("TG").iso).toBe("IN-TS");
    expect(byCode("UT").iso).toBe("IN-UK");
    expect(Object.fromEntries(["OR", "CT", "TG", "UT"].map((code) => [code, ISO_JOIN[`IN:${code}`]?.iso]))).toEqual({
      OR: "IN-OD",
      CT: "IN-CG",
      TG: "IN-TS",
      UT: "IN-UK",
    });
  });

  it("are named with Natural Earth's plain spellings where kuni's have macrons", () => {
    expect([byCode("CT").name, byCode("TG").name, byCode("UT").name, byCode("DH").name]).toEqual([
      "Chhattisgarh",
      "Telangana",
      "Uttarakhand",
      "Dadra and Nagar Haveli and Daman and Diu",
    ]);
    expect(india.regions.every((region) => /^[\x20-\x7e]+$/.test(region.name))).toBe(true);
  });

  it("have Ladakh in the North and the Andaman and Nicobar Islands in the South, which Natural Earth does not group", () => {
    expect([byCode("LA").group, byCode("AN").group]).toEqual(["North", "South"]);
  });

  it("have a code each, and no two the same", () => {
    expect(isos.every((iso) => /^IN-[A-Z]{2}$/.test(iso ?? ""))).toBe(true);
    expect(new Set(isos).size).toBe(36);
  });

  it("have Ladakh and Jammu and Kashmir apart", () => {
    const ladakh = byCode("LA");
    const jammu = byCode("JK");
    expect([ladakh.iso, jammu.iso]).toEqual(["IN-LA", "IN-JK"]);
    expect([ladakh.name, jammu.name]).toEqual(["Ladakh", "Jammu and Kashmir"]);
    expect(ladakh.path).not.toBe(jammu.path);
    expect(ladakh.neighbors).toContain("JK");
    expect(jammu.neighbors).toContain("LA");
  });

  it("have Dadra and Nagar Haveli and Daman and Diu as one region, in more than one piece", () => {
    expect(isos.filter((iso) => iso === "IN-DH")).toHaveLength(1);
    expect(isos).not.toContain("IN-DN");
    expect(isos).not.toContain("IN-DD");
    expect(byCode("DH").path.match(/M/g)!.length).toBeGreaterThan(1);
  });

  it("load by code, and the longitude-and-latitude file has the same regions", async () => {
    expect((await loadDivisions("in"))?.regions).toHaveLength(36);
    const geo = (await loadDivisionsGeo("in"))!;
    expect(geo.features.map((feature) => feature.properties.iso)).toEqual(india.regions.map((region) => region.iso));
  });
});

import { existsSync, readFileSync } from "node:fs";
import { subdivision, subdivisions } from "@johnmorrisdotca/kuni/subdivisions";
import { geoArea } from "d3-geo";
import { describe, expect, it } from "vitest";
import { dissolve, union } from "../scripts/build-data/dissolve.mjs";
import { VIETNAM_2025 } from "../scripts/data-config/vietnam.mjs";

import VN from "./data/divisions/vn.data.ts";
import VN_2025 from "./data/divisions/vn-2025.data.ts";
import VN_GEO from "./data/divisions-geo/vn.data.ts";
import VN_2025_GEO from "./data/divisions-geo/vn-2025.data.ts";
import { loadElementMap } from "./element-base.ts";
import { DIVISIONS_CODES, loadDivisions } from "./load-entry.ts";

const { unchanged, merged, cities } = VIETNAM_2025;
const units = [
  ...unchanged.map((code) => ({ code, from: [code] })),
  ...merged.map((unit) => ({ code: unit.code, from: unit.from.map(([code]) => code) })),
];

/* Resolution 202/2025/QH15 of Viet Nam's National Assembly: 63 provinces and cities into 34 from 2025-07-01. */
describe("Vietnam's 34 provinces and cities of 2025", () => {
  it("has 34 units, 11 left as they were and 23 made by merging, 28 provinces and 6 cities", () => {
    expect(units).toHaveLength(34);
    expect(unchanged).toHaveLength(11);
    expect(merged).toHaveLength(23);
    expect(merged.flatMap((unit) => unit.from)).toHaveLength(52);
    expect(cities).toHaveLength(6);
    for (const city of cities) expect(units.map((unit) => unit.code)).toContain(city);
  });

  it("puts each of the 63 old provinces in exactly one unit, matched on its ISO 3166-2 code", () => {
    const old = units.flatMap((unit) => unit.from).map((code) => `VN-${code}`);
    expect(new Set(old).size).toBe(old.length);
    const iso = subdivisions("VN").map((one) => one.code);
    expect(iso).toHaveLength(63);
    expect([...old].sort()).toEqual([...iso].sort());
    for (const unit of merged) expect(unit.from.map(([code]) => code)).toContain(unit.code);
  });

  it("names each merged unit as kuni names the province whose name it kept", () => {
    for (const unit of merged) {
      const kept = subdivision(`VN-${unit.code}`);
      expect(unit.name, unit.code).toBe(kept.name.en);
      expect(unit.nameJa, unit.code).toBe(kept.name.ja);
      for (const [code, name] of unit.from) expect(subdivision(`VN-${code}`)?.name.en, code).toBe(name);
    }
  });

  it("keeps `vn` the 63 of Natural Earth, and draws the 34 as `vn-2025`, a map of its own", async () => {
    expect(VN.id).toBe("divisions-vn");
    expect(VN.regions).toHaveLength(63);
    expect(VN_GEO.features).toHaveLength(63);
    expect(VN.source).not.toContain("Resolution");
    expect(VN_2025.id).toBe("divisions-vn-2025");
    expect(await loadDivisions("VN-2025")).toBe(VN_2025);
    expect(await loadDivisions("vn")).toBe(VN);
    expect(DIVISIONS_CODES).toContain("VN-2025");
    expect(await loadElementMap("divisions-vn-2025")).toBe(VN_2025);
  });

  it("draws the 34, each named in English and Japanese, with ISO codes only on the 11 ISO still describes", () => {
    const VN = VN_2025;
    expect(VN.regions).toHaveLength(34);
    expect(VN.source).toContain("Resolution 202/2025/QH15");
    expect(VN.regions.map((region) => region.code).sort()).toEqual(units.map((unit) => unit.code).sort());
    for (const region of VN.regions) {
      expect(region.name, region.code).toBeTruthy();
      expect(region.nameJa, region.code).toBeTruthy();
      expect(region.type, region.code).toBe(cities.includes(region.code) ? "city" : "province");
      expect(region.iso, region.code).toBe(unchanged.includes(region.code) ? `VN-${region.code}` : undefined);
    }
    const byCode = new Map(VN.regions.map((region) => [region.code, region]));
    // Natural Earth names VN-39 and VN-66 after the regions they are in; the map names the provinces.
    expect(byCode.get("39")?.name).toBe("Đồng Nai");
    expect(byCode.get("39")?.group).toBe("Đông Nam Bộ");
    expect(byCode.get("66")?.group).toBe("Đồng Bằng Sông Hồng");
    expect(byCode.get("CT")?.group).toBe("đồng bằng sông Cửu Long");
    expect(byCode.get("69")?.group).toBe("Đông Bắc");
    expect(byCode.get("66")?.name).toBe("Hưng Yên");
    expect(byCode.get("SG")?.nameJa).toBe("ホーチミン市");
    expect(byCode.get("26")?.name).toBe("Huế");
    expect(VN_2025_GEO.features.map((feature) => feature.properties.code).sort()).toEqual(
      units.map((unit) => unit.code).sort(),
    );
  });

  it("gives every province a region, with Thái Nguyên's garbled name repaired", () => {
    const groups = new Set(VN.regions.map((region) => region.group));
    expect(groups.has("Vietnam")).toBe(false);
    expect([...groups].some((group) => group.includes("?") || group.includes("Ð"))).toBe(false);
    const byCode = new Map(VN.regions.map((region) => [region.code, region.group]));
    expect(byCode.get("69")).toBe("Đông Bắc");
    expect(byCode.get("53")).toBe("Đông Bắc");
    expect(byCode.get("66")).toBe("Đồng Bằng Sông Hồng");
    expect(byCode.get("27")).toBe("Nam Trung Bộ");
    expect(byCode.get("39")).toBe("Đông Nam Bộ");
    expect(byCode.get("73")).toBe("đồng bằng sông Cửu Long");
    expect(byCode.get("CT")).toBe("đồng bằng sông Cửu Long");
    expect(VN_2025.regions.every((region) => region.group !== "Vietnam")).toBe(true);
  });

  it("joins squares along the edges they share, and keeps a hole", () => {
    const square = (x, y) => ({
      type: "Polygon",
      coordinates: [
        [
          [x, y],
          [x, y + 1],
          [x + 1, y + 1],
          [x + 1, y],
          [x, y],
        ],
      ],
    });
    const two = union([square(0, 0), square(1, 0)]);
    expect(two.type).toBe("Polygon");
    expect(two.coordinates[0]).toHaveLength(7);
    expect(geoArea(two)).toBeCloseTo(geoArea(square(0, 0)) + geoArea(square(1, 0)), 15);
    const ring = [0, 1, 2].flatMap((x) => [0, 1, 2].map((y) => [x, y])).filter(([x, y]) => x !== 1 || y !== 1);
    const framed = union(ring.map(([x, y]) => square(x, y)));
    expect(framed.type).toBe("Polygon");
    expect(framed.coordinates).toHaveLength(2);
    expect(geoArea(framed)).toBeCloseTo(8 * geoArea(square(1, 1)), 6);
    expect(() => dissolve([{ properties: { c: "A" }, geometry: square(0, 0) }], [], (f) => f.properties.c)).toThrow(
      "regions in no unit: A",
    );
  });

  /* Natural Earth's file is in the cache once `pnpm data` has run; CI's data job runs the same check inside the build. */
  const cached = ".cache/ne_10m_admin_1_states_provinces.geojson";
  it.skipIf(!existsSync(cached))(
    "covers exactly the area of the 63, unit by unit and in all",
    () => {
      const all = JSON.parse(readFileSync(cached, "utf8")).features.filter(
        (feature) => feature.properties.iso_a2 === "VN",
      );
      expect(all).toHaveLength(63);
      const codeOf = (feature) => feature.properties.iso_3166_2.replace(/^VN-/, "");
      const joined = dissolve(all, units, codeOf);
      expect(joined).toHaveLength(34);
      const before = all.reduce((sum, feature) => sum + geoArea(feature), 0);
      const after = joined.reduce((sum, feature) => sum + geoArea(feature.geometry), 0);
      expect(Math.abs(after - before) / before).toBeLessThan(1e-9);
    },
    60000,
  );
});

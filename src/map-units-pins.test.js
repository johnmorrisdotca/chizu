import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";

import { NATURAL_EARTH } from "../scripts/data-config.mjs";
import { CHIZU_SOURCE } from "./data/countries.data.ts";

/* The two files the codes without a 1:50m country of their own are cut from (scripts/data-config/outlines.mjs). */
describe("Natural Earth's map units", () => {
  it("reads the two map-units files at the SHA-256 they were reviewed at, and refuses any other bytes", () => {
    const pins = {
      "ne_50m_admin_0_map_units.geojson": "b8d421aca6e9e08e8cdf09cc26af111cc3e0deba4fe915611d58ade71e8a4db0",
      "ne_10m_admin_0_map_units.geojson": "57da82be755f4afccd8f3b14251bb2752f5df1395f47d2d86f817470c4a48862",
    };
    for (const [file, hash] of Object.entries(pins)) {
      expect(NATURAL_EARTH.files[file], file).toBe(hash);
      expect(CHIZU_SOURCE.files).toContain(file);
      const cached = join(".cache", file);
      if (existsSync(cached)) expect(createHash("sha256").update(readFileSync(cached)).digest("hex"), file).toBe(hash);
    }
    const cache = mkdtempSync(join(tmpdir(), "chizu-pin-"));
    try {
      writeFileSync(join(cache, "ne_10m_admin_0_map_units.geojson"), '{"type":"FeatureCollection","features":[]}');
      const read = `import("./scripts/natural-earth.mjs").then((m) => m.source("ne_10m_admin_0_map_units.geojson")).then(() => console.log("read"), (e) => console.log(e.message))`;
      const said = execFileSync(process.execPath, ["-e", read], { env: { ...process.env, CHIZU_CACHE: cache } });
      expect(said.toString()).toContain("is not the file this script was written for");
    } finally {
      rmSync(cache, { recursive: true, force: true });
    }
  });
});

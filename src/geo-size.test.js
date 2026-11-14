import { readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

// What a page pays for the maps in longitude and latitude (MODULES-1142): the files as they are packed, gzipped. The tolerance in scripts/data-config.mjs is chosen to stay under these.
const gzipped = (url) => gzipSync(readFileSync(url), { level: 9 }).length;

describe("the size of the maps in longitude and latitude", () => {
  it("is no more than 1.0 MB gzipped for the regions of all 32 countries together, and no more than 200 kB for any one a page loads", () => {
    const folder = new URL("./data/divisions-geo/", import.meta.url);
    let total = 0;
    const files = readdirSync(folder);
    expect(files).toHaveLength(32);
    for (const file of files) {
      const size = gzipped(new URL(file, folder));
      total += size;
      expect(size, file).toBeLessThan(200 * 1024);
    }
    expect(total).toBeLessThan(1000 * 1024);
  });

  it("is no more than 0.45 MB gzipped for the 1:50m world", () => {
    expect(gzipped(new URL("./data/world-geo-detail.data.ts", import.meta.url))).toBeLessThan(450 * 1024);
  });
});

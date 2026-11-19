// Natural Earth's files as the data scripts read them: from the cache (.cache/, or CHIZU_CACHE), fetched once from the
// project's own repository at the pinned tag, and checked against the SHA-256 this version of the scripts was written
// for (data-config.mjs). Shared by build-data.mjs and wikidata.mjs, so both read exactly the same bytes. The ONS's file
// of Great Britain's councils is read the same way, fetched once from the query data-config.mjs records.
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { NATURAL_EARTH, ONS } from "./data-config.mjs";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const cache = resolve(root, process.env.CHIZU_CACHE ?? ".cache");

/** Natural Earth's file (or the ONS's), from the cache, fetched once and checked against the hash this version of the script was written for. */
export async function source(file) {
  const path = join(cache, file);
  const expected = file === ONS.file ? ONS.sha256 : NATURAL_EARTH.files[file];
  if (!existsSync(path)) {
    mkdirSync(cache, { recursive: true });
    const url = file === ONS.file ? ONS.query : `${NATURAL_EARTH.raw}/${file}`;
    console.log(`fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  const bytes = readFileSync(path);
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== expected) throw new Error(`${file} is not the file this script was written for (sha256 ${hash})`);
  return JSON.parse(bytes.toString("utf8"));
}

/** A feature's properties with lower-case keys: Natural Earth writes them upper case in some files and lower in others. */
export function lowerProperties(feature) {
  return Object.fromEntries(Object.entries(feature.properties ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
}

import { insetsFor } from "./insets.ts";
import { drawnBounds, mainlandBounds, mapOutlines } from "./outlines.ts";
import type { ChizuGroup, ChizuMap, MapBox } from "./types.ts";

/**
 * GROUPS OF PLACES: a continent on the world, a subregion, Japan's Kanto region, the countries of the EU. A group is
 * nothing but a list of codes, so the same few functions show any of them: the map cut down to the group, for a quiz
 * or callouts within it (`groupMap`); the window that frames it (`groupBox`); and the tones that fade everything
 * else (`groupTones`). The continents and subregions come with the package (`CHIZU_CONTINENTS`, `CHIZU_SUBREGIONS`
 * in `/names`); a map's own groups are read from its regions (`regionGroups`); any other grouping is a list of
 * codes the page passes in.
 */

type Groupable = Pick<ChizuMap, "regions">;

/**
 * The groups a map's regions fall in, by their `group`, in the order the map first names them: the continents on the
 * world, the eight regions on Japan's prefectures, the four Census regions on the United States'.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { regionGroups } from "@johnmorrisdotca/chizu";
 *
 * const groups = regionGroups(WORLD);
 * console.log(groups.map((group) => `${group.name} ${group.codes.length}`).join(", "));
 * // Asia 46, Europe 39, Africa 50, North America 18, South America 13, Oceania 7
 * ```
 */
export function regionGroups(map: Pick<ChizuMap, "regions">): ChizuGroup[] {
  const groups = new Map<string, ChizuGroup>();
  for (const region of map.regions) {
    if (region.unnamed) continue;
    let group = groups.get(region.group);
    if (!group) {
      group = { code: region.group, kind: "region", name: region.group, ...(region.groupJa ? { nameJa: region.groupJa } : {}), ...(region.groupAliases ? { aliases: [...region.groupAliases] } : {}), codes: [] };
      groups.set(region.group, group);
    }
    group.codes.push(String(region.code));
  }
  return [...groups.values()];
}

/**
 * The map cut down to a group: the same canvas, only the regions whose codes are given (in the map's order), only
 * their boxes, and neighbours only among themselves. What a quiz or a callout sheet within the group is given, so
 * that "which country of Africa is this?" offers African look-alikes and numbers African countries only. Codes the
 * map does not have are passed over.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { CHIZU_CONTINENTS } from "@johnmorrisdotca/chizu/names";
 * import { findQuestion, groupMap, seededRandom } from "@johnmorrisdotca/chizu";
 *
 * const africa = CHIZU_CONTINENTS.find((continent) => continent.code === "AF")!;
 * const map = groupMap(WORLD, africa.codes, { name: africa.name, nameJa: africa.nameJa });
 * console.log(map.regions.length, findQuestion(map, "KE", seededRandom(1))?.choices.length);
 * // 50 4
 * ```
 */
export function groupMap(map: ChizuMap, codes: ReadonlyArray<string | number>, names: { id?: string; name?: string; nameJa?: string } = {}): ChizuMap {
  const wanted = new Set(codes.map(String));
  const regions = map.regions
    .filter((region) => wanted.has(String(region.code)))
    .map((region) => ({ ...region, neighbors: region.neighbors.filter((code) => wanted.has(String(code))) }));
  return {
    ...map,
    id: names.id ?? `${map.id}-group`,
    name: names.name ?? map.name,
    ...(names.nameJa ?? map.nameJa ? { nameJa: names.nameJa ?? map.nameJa } : {}),
    insets: map.insets.filter((inset) => wanted.has(String(inset.code))),
    regions,
  };
}

const GROUP_MARGIN_RATIO = 0.06;

/**
 * The window that shows a group whole, shaped to the frame it is drawn in (`aspect`, how much wider than tall), with
 * a little room round it. Each member is framed on its mainland (`mainlandBounds`), so France's overseas
 * departments, drawn on the world as part of France, do not stretch Europe's window to South America; a region drawn
 * in a box is framed where it is drawn. The whole map for a group the map has none of.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { CHIZU_CONTINENTS } from "@johnmorrisdotca/chizu/names";
 * import { drawChizu } from "@johnmorrisdotca/chizu/draw";
 * import { groupBox, groupTones } from "@johnmorrisdotca/chizu";
 *
 * const europe = CHIZU_CONTINENTS.find((continent) => continent.code === "EU")!;
 * const svg = drawChizu(WORLD, { box: groupBox(WORLD, europe.codes, 4 / 3), tones: groupTones(WORLD, europe.codes) });
 * console.log(svg.startsWith("<svg"));
 * // true
 * ```
 */
export function groupBox(map: ChizuMap, codes: ReadonlyArray<string | number>, aspect = 1): MapBox {
  const wanted = new Set(codes.map(String));
  const outlines = mapOutlines(map);
  const boxes: [number, number, number, number][] = [];
  map.regions.forEach((region, index) => {
    if (!wanted.has(String(region.code))) return;
    const insets = insetsFor(map, region.code);
    const box = insets.length > 0 ? drawnBounds(region, insets) : mainlandBounds(outlines[index]!.rings, 1);
    if (box) boxes.push(box);
  });
  if (boxes.length === 0) return { x: 0, y: 0, width: map.width, height: map.height };
  const minX = Math.min(...boxes.map((box) => box[0]));
  const minY = Math.min(...boxes.map((box) => box[1]));
  const maxX = Math.max(...boxes.map((box) => box[2]));
  const maxY = Math.max(...boxes.map((box) => box[3]));
  const spanX = Math.max(maxX - minX, 0.001);
  const spanY = Math.max(maxY - minY, 0.001);
  let width = spanX + Math.max(spanX, spanY) * GROUP_MARGIN_RATIO * 2;
  let height = spanY + Math.max(spanX, spanY) * GROUP_MARGIN_RATIO * 2;
  const shape = Math.max(aspect, 0.001);
  if (width / height < shape) width = height * shape;
  else height = width / shape;
  return { x: (minX + maxX) / 2 - width / 2, y: (minY + maxY) / 2 - height / 2, width, height };
}

/**
 * Tones that fade every region outside a group (`faint` unless another tone is named) and leave the group's own as
 * they are, or give them `inside`'s tones: for a map of a continent drawn on the world, with its neighbours as a
 * pale coast round it.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { groupTones } from "@johnmorrisdotca/chizu";
 *
 * const tones = groupTones(WORLD, ["JP", "KR"], "muted", { JP: "selected" });
 * console.log(tones.JP, tones.KR, tones.CN);
 * // selected undefined muted
 * ```
 */
export function groupTones(map: Groupable, codes: ReadonlyArray<string | number>, outside = "faint", inside: Readonly<Record<string, string>> = {}): Record<string, string> {
  const wanted = new Set(codes.map(String));
  const tones: Record<string, string> = {};
  for (const region of map.regions) {
    const code = String(region.code);
    if (!wanted.has(code)) tones[code] = outside;
    else if (inside[code]) tones[code] = inside[code]!;
  }
  return tones;
}

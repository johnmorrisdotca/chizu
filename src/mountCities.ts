import type { ChizuCity } from "./cities.ts";
import type { ChizuMountOptions } from "./mountTypes.ts";

/**
 * THE CITIES OF A MOUNTED MAP: the list it was given, or, for a function that gives one (`loadKuniCities`), the list
 * once it has answered, asked once and again only when a new function is given. Kept apart from mount.ts.
 */
export function mountCities(
  options: () => Pick<ChizuMountOptions, "cities">,
  redraw: () => void,
): () => readonly ChizuCity[] | null {
  let list: readonly ChizuCity[] | null = null;
  let asked: (() => Promise<readonly ChizuCity[]>) | null = null;
  return () => {
    const wanted = options().cities;
    if (!wanted) return null;
    if (typeof wanted !== "function") return wanted;
    if (asked === wanted) return list;
    asked = wanted;
    list = null;
    wanted().then(
      (answer) => {
        if (asked !== wanted) return;
        list = answer;
        redraw();
      },
      () => {
        if (asked === wanted) asked = null;
      },
    );
    return null;
  };
}

import type { ChizuCity } from "./cities.ts";
import type { ChizuMountOptions } from "./mountTypes.ts";

/**
 * THE CITIES OF A MOUNTED MAP: the list it was given, or, for a function that gives one (`loadKuniCities`), the list
 * once it has answered. The function is called once, and again only when a new function is given: an answer to an
 * older one is ignored, and a failure is reported once and not asked again, since the map draws on every pan step.
 * Kept apart from mount.ts.
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
    // A function that throws at once, or answers with no promise, is caught the same way as one that rejects.
    Promise.resolve()
      .then(wanted)
      .then(
        (answer) => {
          if (asked !== wanted) return;
          list = Array.isArray(answer) ? answer : null;
          redraw();
        },
        (error: unknown) => {
          if (asked !== wanted) return;
          console.error(
            "Chizu could not load the cities for this map. For kuni's cities, install @johnmorrisdotca/kuni 1.6.0 or later beside @johnmorrisdotca/chizu.",
            error,
          );
        },
      );
    return null;
  };
}

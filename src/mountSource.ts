import { type SmallStateDots, smallStateDots } from "./mountSmallStates.ts";
import type { ChizuMap } from "./types.ts";
import { type ChizuViewData, type ChizuViewId, withView } from "./views.ts";

/**
 * What `mountChizu` draws from the map it is given: the map with a point of view applied (`view`) and the world's smallest
 * countries added as dots (`smallStates`). Each is its own chunk, fetched only when asked for, so the core stays as small
 * as it was; the map is drawn at once without them and again when they arrive.
 */
export type MapSource = SmallStateDots;

/**
 * `read` gives the mount's current options and `redraw` sets the mount's map from `dotted` and draws it. A view that
 * arrives after the page asked for another, or after the mount has gone, draws nothing.
 */
export function mapSource(
  read: () => { view?: ChizuViewId | null; smallStates?: boolean },
  redraw: () => void,
): MapSource {
  const dots = smallStateDots(() => read().smallStates === true, redraw);
  let seen: ChizuViewData | null = null;
  let asking: ChizuViewId | null = null;
  let gone = false;
  const wanted = (): ChizuViewId | null => read().view ?? null;
  const loadView = (): void => {
    const id = wanted();
    if (id === null || seen?.id === id || asking === id) return;
    asking = id;
    import("./viewsLoad.ts")
      .then((loaded) => loaded.loadView(id))
      .then(
        (data) => {
          if (asking === id) asking = null;
          seen = data;
          if (!gone && wanted() === id) redraw();
        },
        () => {
          if (asking === id) asking = null;
        },
      );
  };
  const viewed = (one: ChizuMap): ChizuMap => (seen && seen.id === wanted() ? withView(one, seen) : one);
  return {
    dotted: (one) => dots.dotted(viewed(one)),
    sync: () => {
      if (wanted() !== null && seen?.id !== wanted()) loadView();
      else if (read().smallStates !== true) redraw();
      dots.sync();
    },
    load: () => {
      loadView();
      dots.load();
    },
    stop: () => {
      gone = true;
      dots.stop();
    },
  };
}

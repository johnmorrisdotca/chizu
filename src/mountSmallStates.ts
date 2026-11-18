import type { ChizuMap } from "./types.ts";

/** What `mountChizu` keeps for the world's smallest countries as dots (`smallStates`). */
export interface SmallStateDots {
  /** The map with the dots added, once their table has come and while the option is on; the map itself otherwise. */
  dotted(one: ChizuMap): ChizuMap;
  /** Draws again with the dots as the option now says, fetching their table first if it has not come yet. */
  sync(): void;
  /** Fetches the table if the option is on and it has not come yet; `redraw` runs when it comes. */
  load(): void;
  /** The map has gone: a table that comes later draws nothing. */
  stop(): void;
}

/**
 * The dots' table is its own chunk (`./smallStates.ts`), fetched only when a map asks for it, so the core stays as small
 * as it was. `isOn` reads the mount's current option; `redraw` sets the mount's map from `dotted` and draws it.
 */
export function smallStateDots(isOn: () => boolean, redraw: () => void): SmallStateDots {
  let withDots: ((one: ChizuMap) => ChizuMap) | null = null;
  let gone = false;
  const load = (): void => {
    if (withDots || !isOn()) return;
    import("./smallStates.ts").then(
      (loaded) => {
        withDots = loaded.withSmallStates;
        if (!gone && isOn()) redraw();
      },
      () => {},
    );
  };
  return {
    dotted: (one) => (isOn() && withDots ? withDots(one) : one),
    sync: () => (withDots || !isOn() ? redraw() : load()),
    load,
    stop: () => {
      gone = true;
    },
  };
}

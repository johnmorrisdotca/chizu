import type { ChizuDrawOptions } from "./draw.ts";
import type { ChizuMountOptions } from "./mountTypes.ts";
import type { MapBox } from "./types.ts";

/**
 * The callouts to draw for a mounted map's window: the corner the buttons sit in, in the map's own units, so that
 * numbered callouts keep out from under them.
 *
 * @param options - The map's options now.
 * @param window_ - The part of the map in view.
 * @param stageWidth - The width of the stage in pixels (0 before it is laid out).
 * @returns `drawChizu`'s `callouts`, or undefined for none.
 */
export function buttonsKeepOut(
  options: Pick<ChizuMountOptions, "callouts" | "controls">,
  window_: MapBox,
  stageWidth: number,
): ChizuDrawOptions["callouts"] {
  const wanted = options.callouts;
  if (!wanted) return undefined;
  const request = Array.isArray(wanted)
    ? { codes: wanted as readonly string[] }
    : (wanted as Exclude<ChizuDrawOptions["callouts"], readonly string[] | undefined>);
  if (request.keepOut || options.controls === false) return request;
  const pixels = stageWidth > 0 ? stageWidth : 640;
  const unit = window_.width / pixels;
  // Up the right edge as far as the three buttons reach, and along the bottom as far as they are wide.
  return { ...request, keepOut: { bottom: 64 * unit, right: 170 * unit } };
}

/** What a key does to a mounted map: move the window by a step in each direction, zoom one step, or go back to the whole map. */
export type ChizuKeyAction = { move: readonly [number, number] } | { zoom: 1 | -1 } | "whole";

const ARROWS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/** The action a key stands for on a mounted map, or null for a key the map leaves to the page. */
export function keyAction(key: string): ChizuKeyAction | null {
  const move = ARROWS[key];
  if (move) return { move };
  if (key === "+" || key === "=") return { zoom: 1 };
  if (key === "-" || key === "_") return { zoom: -1 };
  return key === "0" ? "whole" : null;
}

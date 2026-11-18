/**
 * A mounted map's two questions of a place: which one the pointer is resting on (`onHover`) and which one the keyboard
 * has reached (`onFocus`). Kept apart from `mount.ts`, which draws and moves the map; this only watches the stage.
 *
 * Pointer: a mouse or a pen over a region says its code, and null on leaving it, on leaving the map and for as long as
 * a button is held (a drag, a press). A finger says nothing: touch has no hover, so a page must not depend on one.
 *
 * Keyboard: regions are not in the tab order (there are too many). The map is the one tab stop; with it focused,
 * Shift and an arrow key move the focus to the nearest region in that direction, Enter or Space presses the focused
 * region, and Escape gives the focus back to the map. The focus on a region is a real focus (`role="button"`, a name),
 * so a screen reader says it.
 */
import type { ChizuMountOptions } from "./mountTypes.ts";

type Callbacks = Pick<ChizuMountOptions, "onHover" | "onFocus">;
type Root = Document | ShadowRoot;

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

/** What can be reached with the keyboard: a region or a feature, never an inset's frame or a callout's number. */
const REACHABLE = "[data-code][data-interactive]:not(.cz-inset):not(.cz-callout)";

/**
 * Watch a stage for the pointer resting on a place and for the keyboard reaching one.
 *
 * @param stage - The element the map's SVG is drawn into; it is the map's one tab stop.
 * @param callbacks - The options now, read at each event, so a later `set` of `onHover` or `onFocus` is heard.
 * @param press - What a press of a place does (choose it); called for Enter or Space on a focused one.
 * @returns `redrawn`, to call after the stage's drawing is replaced or moved (what is under the pointer, and which place holds the focus, are looked at again); and `destroy`.
 */
export function watchPlaces(
  stage: HTMLElement,
  callbacks: () => Callbacks,
  press: (code: string) => void,
): { redrawn(): void; destroy(): void } {
  const root = (): Root => stage.getRootNode() as Root;
  const codeOf = (node: Element | null | undefined): string | null => {
    const hit = node?.closest?.("[data-code]") as HTMLElement | null | undefined;
    if (!hit || !stage.contains(hit) || hit.classList.contains("cz-inset")) return null;
    return hit.dataset.code ?? null;
  };

  // ---- the pointer ----
  const held = new Set<number>();
  let hovered: string | null = null;
  let at: { x: number; y: number } | null = null;
  const hover = (code: string | null) => {
    if (code === hovered) return;
    hovered = code;
    callbacks().onHover?.(code);
  };
  const look = () => {
    if (!at || held.size > 0) return;
    const under = root().elementFromPoint(at.x, at.y);
    hover(under && stage.contains(under) ? codeOf(under) : null);
  };
  const touch = (event: PointerEvent) => event.pointerType === "touch";
  const onDown = (event: PointerEvent) => {
    byPointer = true;
    if ((event.target as Element).closest?.(".czm-controls")) return;
    held.add(event.pointerId);
    hover(null);
  };
  const onUp = (event: PointerEvent) => {
    held.delete(event.pointerId);
    if (touch(event)) return;
    at = { x: event.clientX, y: event.clientY };
    look();
  };
  const onMove = (event: PointerEvent) => {
    if (touch(event)) return;
    at = { x: event.clientX, y: event.clientY };
    if (held.size > 0) return;
    hover(codeOf(event.target as Element));
  };
  const onLeave = (event: PointerEvent) => {
    if (touch(event)) return;
    at = null;
    if (held.size === 0) hover(null);
  };

  // ---- the keyboard ----
  /** Set by a press of the pointer, cleared by a key: a focus a click gave to a place is not one the keyboard reached. */
  let byPointer = false;
  let focused: string | null = null;
  const focusAt = (): HTMLElement | null => {
    const active = root().activeElement as HTMLElement | null;
    return active && active !== stage && stage.contains(active) && active.matches(REACHABLE) ? active : null;
  };
  const sync = () => {
    const place = byPointer ? null : focusAt();
    const code = place?.dataset.code ?? null;
    if (code === focused) return;
    focused = code;
    callbacks().onFocus?.(code);
  };
  // A redraw takes the focused element out and the page puts it back, so a focus that has moved is looked at once the
  // events are done, not at the first of them.
  const later = () => queueMicrotask(sync);
  const place = (code: string): HTMLElement | null =>
    [...stage.querySelectorAll<HTMLElement>(REACHABLE)].find((one) => one.dataset.code === code) ?? null;

  const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  /** The nearest place in a direction from the one holding the focus (or from the middle of the map), among those in view. */
  const next = (dx: number, dy: number): HTMLElement | null => {
    const view = stage.getBoundingClientRect();
    const here = focusAt();
    const from = centre(here ? here.getBoundingClientRect() : view);
    let best: HTMLElement | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const one of stage.querySelectorAll<HTMLElement>(REACHABLE)) {
      if (one === here) continue;
      const r = one.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const c = centre(r);
      if (c.x < view.left || c.x > view.right || c.y < view.top || c.y > view.bottom) continue;
      const along = (c.x - from.x) * dx + (c.y - from.y) * dy;
      const across = Math.abs((c.x - from.x) * dy) + Math.abs((c.y - from.y) * dx);
      // From the middle of the map any direction takes the nearest place; from a place, only those ahead of it.
      if (here && (along <= 0 || across > along * 2)) continue;
      const score = here ? along + across * 2 : Math.hypot(c.x - from.x, c.y - from.y);
      if (score < bestScore) {
        best = one;
        bestScore = score;
      }
    }
    return best;
  };
  const onKey = (event: KeyboardEvent) => {
    byPointer = false;
    if ((event.target as Element).closest?.(".czm-controls")) return;
    const arrow = ARROWS[event.key];
    if (arrow && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Shift and an arrow is this's; the bare arrows keep moving the map.
      event.preventDefault();
      event.stopImmediatePropagation();
      next(arrow[0], arrow[1])?.focus({ preventScroll: true });
      sync();
      return;
    }
    const here = focusAt();
    if (here && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      press(here.dataset.code ?? "");
    } else if (here && event.key === "Escape") {
      event.preventDefault();
      stage.focus({ preventScroll: true });
      sync();
    }
  };

  stage.addEventListener("pointerdown", onDown, true);
  stage.addEventListener("pointerup", onUp, true);
  stage.addEventListener("pointercancel", onUp, true);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("focusin", later);
  stage.addEventListener("focusout", later);
  stage.addEventListener("keydown", onKey);

  return {
    redrawn() {
      // The drawing was replaced: what is under the pointer may be another place, and the focused one is a new element.
      look();
      if (focused === null) return;
      const again = place(focused);
      if (again) again.focus({ preventScroll: true });
      else stage.focus({ preventScroll: true });
      sync();
    },
    destroy() {
      stage.removeEventListener("pointerdown", onDown, true);
      stage.removeEventListener("pointerup", onUp, true);
      stage.removeEventListener("pointercancel", onUp, true);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("focusin", later);
      stage.removeEventListener("focusout", later);
      stage.removeEventListener("keydown", onKey);
      hover(null);
    },
  };
}

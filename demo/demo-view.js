// The demo's point of view on a disputed place: Natural Earth's own lines, Ukraine's (Crimea and Sevastopol in Ukraine) or
// Japan's (the Northern Territories in Japan). `view` on mountChizu fetches the view's outlines the first time it is chosen.

import { language, live, remember, state } from "./demo-core.js";
import { CHIZU_VIEWS } from "./dist/views-entry.js";

export const VIEW_CHOICES = ["default", ...CHIZU_VIEWS.map((view) => view.id).reverse()];

/** What the mounted map is told for the present choice: no view for the default. */
export const viewOptions = (choice) => ({ view: choice === "default" ? null : choice });

/** The note under the row: what the chosen view does and why, in the page's language; nothing for the default. */
export function showViewNote() {
  const note = document.getElementById("view-note");
  const view = CHIZU_VIEWS.find((one) => one.id === state.view);
  note.textContent = view ? (language.lang === "ja" ? view.noteJa : view.note) : "";
  note.hidden = !view;
}

export function chooseView(choice, settings) {
  state.view = choice;
  remember({ view: choice === "default" ? null : choice });
  settings();
  live.mount.set(viewOptions(choice));
}

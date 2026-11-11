/** The shared custom-element base: loading a map, drawing it, and the attributes every element reflects. */
import { isChizuColour } from "./draw.ts";
import { CHIZU_FEATURE_GROUPS, type ChizuFeatureChoice, featuresShown } from "./features.ts";
import type { MapZoom } from "./frame.ts";
import { loadCountry, loadDivisions, loadFeatures } from "./load-entry.ts";
import { type ChizuMount, type ChizuMountOptions, mountChizu } from "./mount.ts";
import { CHIZU_MAP_STYLE } from "./mountStyle.ts";
import { type ChizuLanguage, nameOf } from "./strings.ts";
import type { ChizuFeatureLayer, ChizuMap as MapData } from "./types.ts";
import WORLD from "./world-entry.ts";

const ElementBase: typeof HTMLElement =
  typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;
export const COMMON = ["region", "lang", "theme", "size", "width", "label", "colors"];
export const on = (element: Element, name: string, fallback = false) =>
  element.hasAttribute(name)
    ? !["off", "false", "no", "0"].includes((element.getAttribute(name) ?? "").trim().toLowerCase())
    : fallback;
export const number = (value: string | null, fallback: number, min: number, max: number) =>
  value === null || value.trim() === "" || !Number.isFinite(Number(value))
    ? fallback
    : Math.min(max, Math.max(min, Number(value)));
export const write = (element: Element, name: string, value: unknown) =>
  value === null || value === undefined
    ? element.removeAttribute(name)
    : element.setAttribute(name, value === true ? "" : String(value));
const localStyle = CHIZU_MAP_STYLE.replaceAll(
  ':root:not([data-theme="light"])',
  ':host(:not([theme="light"]))',
).replaceAll(':root[data-theme="dark"]', ':host([theme="dark"])');
const STYLE = `${localStyle}
:host{display:block;max-width:100%;color:CanvasText;font-family:system-ui;box-sizing:border-box} :host([hidden]){display:none}
.wrap{display:grid;gap:8px;min-width:0;background:Canvas;color:CanvasText;padding:12px;border-radius:12px;box-sizing:border-box}.wrap .map .czm-controls{display:flex;gap:6px}.map{min-width:0}.choose,button{min-height:44px;font:inherit;border:1px solid currentColor;border-radius:8px;background:Canvas;color:CanvasText;padding:8px;box-sizing:border-box;max-width:100%}.choose{width:100%}.choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}p{margin:0;line-height:1.4}.result{min-height:1.4em}button:focus-visible,select:focus-visible{outline:3px solid #b5452c;outline-offset:2px}
.cz-tone-data-0 .cz-land{fill:#eff3ff}.cz-tone-data-1 .cz-land{fill:#bdd7e7}.cz-tone-data-2 .cz-land{fill:#6baed6}.cz-tone-data-3 .cz-land{fill:#3182bd}.cz-tone-data-4 .cz-land{fill:#08519c}.locator-pin{fill:#b5452c;stroke:#fff;stroke-width:2;vector-effect:non-scaling-stroke;pointer-events:none}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
`;

/** Options that require host code rather than an HTML attribute. The existing mounted-map options stay available.
 *
 * @example
 * ```ts no-run
 * import { ChizuMapElement, type ChizuElementOptions } from "@johnmorrisdotca/chizu/element";
 * const options: ChizuElementOptions = { controls: false, data: { JP: 10 }, colors: { JP: "#2f6b4f" }, capital: false };
 * const map = new ChizuMapElement();
 * map.options = options;
 * document.body.append(map);
 * ```
 */
export type ChizuElementOptions = Partial<ChizuMountOptions> & {
  /** Finite figures keyed by a region's code or ISO code, drawn in five shades. */
  data?: Readonly<Record<string, number>>;
  /** Add capital markers; false hides them even when all features are chosen. Defaults to true for map/locator embeds; quiz feature choices stay unchanged. */
  capital?: boolean;
};

/** Real host option keys, kept complete by TypeScript and checked by the builder's coverage gate.
 *
 * @example
 * ```ts
 * import { CHIZU_ELEMENT_OPTION_KEYS } from "@johnmorrisdotca/chizu/element";
 * console.log(CHIZU_ELEMENT_OPTION_KEYS.includes("map"), CHIZU_ELEMENT_OPTION_KEYS.includes("data"));
 * // true true
 * ```
 */
export const CHIZU_ELEMENT_OPTION_KEYS = Object.keys({
  map: true,
  language: true,
  zoom: true,
  tones: true,
  colors: true,
  capital: true,
  onSelect: true,
  onView: true,
  callouts: true,
  labels: true,
  selected: true,
  fit: true,
  selectable: true,
  controls: true,
  detail: true,
  detailFrom: true,
  features: true,
  featureLayer: true,
  featureLabels: true,
  cities: true,
  cityOptions: true,
  overlays: true,
  data: true,
} satisfies Record<keyof ChizuElementOptions, boolean>);

/** Load a built-in map by `world`, `country-<ISO>` or `divisions-<ISO>`. Invalid names return null.
 *
 * @example
 * ```ts
 * import { loadElementMap } from "@johnmorrisdotca/chizu/element";
 * console.log((await loadElementMap("country-jp"))?.id, await loadElementMap("invalid"));
 * // country-jp null
 * ```
 * @param region - The built-in map id, such as world or country-jp.
 * @returns The loaded native map, or null for an unavailable map id.
 */
export async function loadElementMap(region: string): Promise<MapData | null> {
  if (region === "world") return WORLD;
  const match = /^(country|divisions)-([a-z]{2,3})$/i.exec(region);
  const kind = match?.[1];
  const code = match?.[2];
  if (kind === undefined || code === undefined) return null;
  return kind.toLowerCase() === "country" ? loadCountry(code) : loadDivisions(code);
}

/** Parse finite choropleth figures; invalid JSON and nested or non-numeric values are rejected.
 *
 * @example
 * ```ts
 * import { readMapData } from "@johnmorrisdotca/chizu/element";
 * console.log(JSON.stringify(readMapData('{"JP":10}')), readMapData('{"JP":"bad"}'));
 * // {"JP":10} null
 * ```
 * @param text - The JSON text to read; null means no data.
 * @returns Finite values keyed by place code, or null when no data was supplied.
 */
export function readMapData(text: string | null): Record<string, number> | null {
  if (text === null || text === "") return {};
  if (text.length > 16000) return null;
  try {
    const values: unknown = JSON.parse(text);
    if (values === null || typeof values !== "object" || Array.isArray(values)) return null;
    const entries = Object.entries(values);
    if (
      entries.length > 1500 ||
      entries.some(
        ([code, value]) => !/^[\w-]{1,40}$/.test(code) || typeof value !== "number" || !Number.isFinite(value),
      )
    )
      return null;
    return Object.fromEntries(entries);
  } catch {
    return null;
  }
}

/** Parse region colours, including native CSS colours with commas inside rgb()/hsl().
 * @param text - Comma-separated code:colour pairs; null or empty means no overrides.
 * @returns The validated colour map, or null for malformed or unsafe values.
 * @example
 * ```ts
 * import { readMapColors } from "@johnmorrisdotca/chizu/element";
 * console.log(readMapColors("JP:#2f6b4f,GB:rgb(138,59,59)")?.JP);
 * console.log(readMapColors("JP:url(evil)"));
 * // #2f6b4f
 * // null
 * ```
 */
export function readMapColors(text: string | null): Record<string, string> | null {
  if (text === null || text.trim() === "") return {};
  if (text.length > 16000) return null;
  const pairs = text.split(/,(?=\s*[\w-]{1,40}\s*:)/);
  if (pairs.length > 1500) return null;
  const entries: [string, string][] = [];
  for (const pair of pairs) {
    const match = /^\s*([\w-]{1,40})\s*:\s*(.+?)\s*$/.exec(pair);
    if (!match || !isChizuColour(match[2]!)) return null;
    entries.push([match[1]!, match[2]!.trim()]);
  }
  return Object.fromEntries(entries);
}

/** Shared lifecycle for the three elements. Async map changes never put an old map into a newly configured element. */
export class ChizuElement extends ElementBase {
  protected kind: "map" | "locator" | "quiz" = "map";
  protected root: ShadowRoot | null = null;
  protected mount: ChizuMount | null = null;
  protected options_: ChizuElementOptions = {};
  protected language: ChizuLanguage = "en";
  #revision = 0;
  #scheduled = false;
  #languageWatcher: MutationObserver | null = null;

  /** Host-only mounted-map options; assigning them redraws the element. */
  get options(): ChizuElementOptions {
    return this.options_;
  }
  set options(value: ChizuElementOptions) {
    this.options_ = value ?? {};
    this.refresh();
  }

  /**
   * Lines, marks and shaded areas from latitude and longitude (`ChizuOverlay`). Setting them draws only them again: the
   * map, its zoom and its window stay as they are, so a track can move every few seconds. Kept in `options.overlays`.
   */
  get overlays(): ChizuElementOptions["overlays"] {
    return this.options_.overlays;
  }
  set overlays(value: ChizuElementOptions["overlays"]) {
    this.options_ = { ...this.options_, overlays: value ?? [] };
    if (this.mount) this.mount.set({ overlays: value ?? [] });
    else this.refresh();
  }

  /** Per-region colours as comma-separated code:colour pairs; a present attribute overrides host colours. */
  get colors(): string | null {
    return this.getAttribute("colors");
  }
  set colors(value: string | null | undefined) {
    write(this, "colors", value);
  }
  /** Whether capital markers are requested; defaults to true for maps/locators and false for quizzes. */
  get capital(): boolean {
    return on(this, "capital", this.options_.capital ?? this.kind !== "quiz");
  }
  set capital(value: boolean | string | null | undefined) {
    write(this, "capital", value);
  }

  connectedCallback(): void {
    this.root ??= this.attachShadow({ mode: "open" });
    this.#languageWatcher ??= new MutationObserver(() => this.refresh());
    this.#languageWatcher.observe(this.ownerDocument.documentElement, { attributes: true, attributeFilter: ["lang"] });
    this.refresh();
  }
  disconnectedCallback(): void {
    this.#revision += 1;
    this.mount?.destroy();
    this.mount = null;
    this.#languageWatcher?.disconnect();
    this.#languageWatcher = null;
  }
  attributeChangedCallback(): void {
    this.refresh();
  }

  /** Redraw after a host changes options, coalescing attribute changes into one map load. */
  refresh(): void {
    if (!this.isConnected || this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => {
      this.#scheduled = false;
      void this.#render();
    });
  }
  protected tell(type: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
  }
  protected text(tag: string, value: string): HTMLElement {
    const element = this.ownerDocument.createElement(tag);
    element.textContent = value;
    return element;
  }
  protected words(en: string, ja: string): string {
    return this.language === "ja" ? ja : en;
  }

  async #render(): Promise<void> {
    const revision = ++this.#revision;
    this.removeAttribute("data-ready");
    try {
      const region = this.getAttribute("region") ?? "world";
      const map = this.options_.map ?? (await loadElementMap(region));
      if (!map) throw new Error("Choose world, country-<ISO> or divisions-<ISO>.");
      const features = this.featureChoices();
      let layer =
        typeof this.options_.featureLayer === "function"
          ? await this.options_.featureLayer(map.id)
          : (this.options_.featureLayer ??
            (features.length > 0 || this.kind === "locator" ? await loadFeatures(map.id) : null));
      if ((this.hasAttribute("capital") || this.options_.capital !== undefined) && !this.capital && layer)
        layer = { ...layer, features: layer.features.filter((feature) => feature.group !== "capitals") };
      if (!this.isConnected || revision !== this.#revision) return;
      this.mount?.destroy();
      this.mount = null;
      this.language = (
        this.getAttribute("lang") ??
        this.options_.language ??
        this.closest("[lang]")?.getAttribute("lang") ??
        this.ownerDocument.documentElement.lang
      )
        .toLowerCase()
        .startsWith("ja")
        ? "ja"
        : "en";
      if (this.hasAttribute("colors") && readMapColors(this.colors) === null)
        throw new Error(
          this.words(
            "Colours must be code:colour pairs with valid CSS colours.",
            "地域コードと有効なCSSの色を、コード:色の形式で指定してください。",
          ),
        );
      const theme = this.getAttribute("theme");
      this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
      const width = number(this.getAttribute("width"), 0, 0, 2000);
      const sized = { small: 320, medium: 480, large: 720 }[this.getAttribute("size") ?? "medium"] ?? 480;
      this.style.width = `${width || sized}px`;
      const style = this.ownerDocument.createElement("style");
      style.textContent = STYLE;
      const wrap = this.ownerDocument.createElement("div");
      wrap.className = "wrap";
      if (this.getAttribute("label") !== null) {
        wrap.setAttribute("role", "group");
        wrap.setAttribute("aria-label", this.getAttribute("label")!);
      }
      this.root!.replaceChildren(style, wrap);
      this.draw(wrap, map, layer, features);
      this.setAttribute("data-ready", "true");
      this.tell("chizu-load", { kind: this.kind, region: map.id, width: map.width, height: map.height });
    } catch (error) {
      if (!this.isConnected || revision !== this.#revision) return;
      this.mount?.destroy();
      this.mount = null;
      const message = error instanceof Error ? error.message : String(error);
      const status = this.text("p", message);
      status.setAttribute("role", "status");
      this.root!.replaceChildren(status);
      this.tell("chizu-error", { kind: this.kind, message });
    }
  }
  protected featureChoices(): ChizuFeatureChoice[] {
    const asked = this.getAttribute("features");
    let choices: ChizuFeatureChoice[] =
      asked === null
        ? [...(this.options_.features ?? [])]
        : ["water", "all", "capitals"].includes(asked)
          ? [asked as ChizuFeatureChoice]
          : [];
    if (this.kind !== "quiz" || this.hasAttribute("capital") || this.options_.capital !== undefined) {
      if (this.capital) choices.push("capitals");
      else
        choices = choices.flatMap((choice) =>
          choice === "all"
            ? CHIZU_FEATURE_GROUPS.filter((group) => group !== "capitals")
            : ["capital", "seat", "capitals"].includes(choice)
              ? []
              : [choice],
        );
    }
    return [...new Set(choices)];
  }
  protected colourOptions(map: MapData): Record<string, string> {
    const input = this.hasAttribute("colors") ? readMapColors(this.colors)! : (this.options_.colors ?? {});
    return Object.fromEntries(
      Object.entries(input).map(([code, colour]) => [
        map.regions.find((region) => region.code === code || region.iso === code)?.code ?? code,
        colour,
      ]),
    );
  }
  protected draw(
    wrap: HTMLElement,
    map: MapData,
    layer: ChizuFeatureLayer | null,
    features: ChizuFeatureChoice[],
  ): void {
    const data = this.options_.data ?? readMapData(this.getAttribute("data"));
    if (data === null) throw new Error("Data must be a JSON object of finite figures keyed by region code.");
    const entries = Object.entries(data).filter(([, value]) => Number.isFinite(value));
    const figures = entries.map(([, value]) => value);
    const low = Math.min(...figures);
    const high = Math.max(...figures);
    const tones: Record<string, string> = { ...this.options_.tones };
    for (const [code, value] of entries) {
      const region = map.regions.find((one) => one.code === code || one.iso === code);
      if (region)
        tones[region.code] = `data-${high === low ? 2 : Math.min(4, Math.floor(((value - low) / (high - low)) * 5))}`;
    }
    for (const code of (this.getAttribute("highlight") ?? "").split(/[\s,]+/)) {
      const region = map.regions.find((one) => one.code === code || one.iso === code);
      if (region) tones[region.code] = "selected";
    }
    const stage = this.text("div", "");
    stage.className = "map";
    wrap.append(stage);
    const selectable = on(this, "selectable", this.options_.selectable ?? true);
    this.mount = mountChizu(stage, {
      ...this.options_,
      colors: this.colourOptions(map),
      map,
      featureLayer: layer,
      features,
      language: this.language,
      tones,
      labels: this.hasAttribute("labels") ? on(this, "labels") : this.options_.labels,
      controls: on(this, "controls", this.options_.controls ?? true),
      selectable,
      zoom: Math.round(number(this.getAttribute("zoom"), this.options_.zoom ?? 1, 1, 10)) as MapZoom,
      onSelect: (code) => {
        const choose = wrap.querySelector("select");
        if (choose) choose.value = code ?? "";
        this.tell("chizu-select", { region: map.id, code });
        this.options_.onSelect?.(code);
      },
      onView: (view) => {
        this.tell("chizu-view", { region: map.id, ...view });
        this.options_.onView?.(view);
      },
    });
    if (selectable) {
      const choose = this.ownerDocument.createElement("select");
      choose.className = "choose";
      choose.setAttribute("aria-label", this.words("Choose a place", "場所を選ぶ"));
      const empty = this.ownerDocument.createElement("option");
      empty.value = "";
      empty.textContent = this.words("Nothing chosen", "選択なし");
      choose.append(empty);
      for (const region of [
        ...map.regions.filter((one) => !one.unnamed),
        ...(layer ? featuresShown(layer, features) : []),
      ]) {
        const option = this.ownerDocument.createElement("option");
        option.value = region.code;
        option.textContent = nameOf(region, this.language);
        choose.append(option);
      }
      choose.addEventListener("change", () => {
        const code = choose.value || null;
        this.mount?.select(code);
        this.tell("chizu-select", { region: map.id, code });
        this.options_.onSelect?.(code);
      });
      wrap.append(choose);
    }
    if (figures.length) wrap.append(this.text("p", `${this.words("Figures", "数値")}: ${low}–${high}`));
  }
}

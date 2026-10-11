/** Browser elements for maps, located places and seeded geography questions. Importing this entry is safe on a server. */
import WORLD from "./world-entry.ts";
import { loadCountry, loadDivisions, loadFeatures } from "./load-entry.ts";
import { mountChizu, type ChizuMount, type ChizuMountOptions } from "./mount.ts";
import { CHIZU_MAP_STYLE } from "./mountStyle.ts";
import { featureMap, featuresShown, type ChizuFeatureChoice } from "./features.ts";
import { findQuestion, type FindQuestion } from "./quiz.ts";
import { seededRandom, type Random } from "./random.ts";
import type { MapZoom } from "./frame.ts";
import { projectPoint } from "./project.ts";
import { nameOf, type ChizuLanguage } from "./strings.ts";
import type { ChizuMap as MapData, ChizuFeatureLayer, ChizuRegion } from "./types.ts";

const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? class {} as unknown as typeof HTMLElement : HTMLElement;
const COMMON = ["region", "lang", "theme", "size", "width", "label"];
const on = (element: Element, name: string, fallback = false) => element.hasAttribute(name) ? !["off", "false", "no", "0"].includes((element.getAttribute(name) ?? "").trim().toLowerCase()) : fallback;
const number = (value: string | null, fallback: number, min: number, max: number) => value === null || value.trim() === "" || !Number.isFinite(Number(value)) ? fallback : Math.min(max, Math.max(min, Number(value)));
const write = (element: Element, name: string, value: unknown) => value === null || value === undefined ? element.removeAttribute(name) : element.setAttribute(name, value === true ? "" : String(value));
const localStyle = CHIZU_MAP_STYLE.replaceAll(':root:not([data-theme="light"])', ':host(:not([theme="light"]))').replaceAll(':root[data-theme="dark"]', ':host([theme="dark"])');
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
 * const options: ChizuElementOptions = { controls: false, data: { JP: 10 } };
 * const map = new ChizuMapElement();
 * map.options = options;
 * document.body.append(map);
 * ```
 */
export type ChizuElementOptions = Partial<ChizuMountOptions> & {
  /** Finite figures keyed by a region's code or ISO code, drawn in five shades. */
  data?: Readonly<Record<string, number>>;
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
export const CHIZU_ELEMENT_OPTION_KEYS = Object.keys({ map: true, language: true, zoom: true, tones: true, colors: true, onSelect: true, onView: true, callouts: true, labels: true, selected: true, fit: true, selectable: true, controls: true, detail: true, detailFrom: true, features: true, featureLayer: true, featureLabels: true, data: true } satisfies Record<keyof ChizuElementOptions, boolean>);

/** Load a built-in map by `world`, `country-<ISO>` or `divisions-<ISO>`. Invalid names return null. 
 *
 * @example
 * ```ts
 * import { loadElementMap } from "@johnmorrisdotca/chizu/element";
 * console.log((await loadElementMap("country-jp"))?.id, await loadElementMap("invalid"));
 * // country-jp null
 * ```
 */
export async function loadElementMap(region: string): Promise<MapData | null> {
  if (region === "world") return WORLD;
  const match = /^(country|divisions)-([a-z]{2,3})$/i.exec(region);
  if (!match) return null;
  return match[1].toLowerCase() === "country" ? loadCountry(match[2]) : loadDivisions(match[2]);
}

/** Parse finite choropleth figures; invalid JSON and nested or non-numeric values are rejected. 
 *
 * @example
 * ```ts
 * import { readMapData } from "@johnmorrisdotca/chizu/element";
 * console.log(JSON.stringify(readMapData('{"JP":10}')), readMapData('{"JP":"bad"}'));
 * // {"JP":10} null
 * ```
 */
export function readMapData(text: string | null): Record<string, number> | null {
  if (text === null || text === "") return {};
  if (text.length > 16000) return null;
  try {
    const values: unknown = JSON.parse(text);
    if (values === null || typeof values !== "object" || Array.isArray(values)) return null;
    const entries = Object.entries(values);
    if (entries.length > 1500 || entries.some(([code, value]) => !/^[\w-]{1,40}$/.test(code) || typeof value !== "number" || !Number.isFinite(value))) return null;
    return Object.fromEntries(entries);
  } catch { return null; }
}

/** Shared lifecycle for the three elements. Async map changes never put an old map into a newly configured element. */
class ChizuElement extends ElementBase {
  protected kind: "map" | "locator" | "quiz" = "map";
  protected root: ShadowRoot | null = null;
  protected mount: ChizuMount | null = null;
  protected options_: ChizuElementOptions = {};
  protected language: ChizuLanguage = "en";
  #revision = 0;
  #scheduled = false;
  #languageWatcher: MutationObserver | null = null;

  /** Host-only mounted-map options; assigning them redraws the element. */
  get options(): ChizuElementOptions { return this.options_; }
  set options(value: ChizuElementOptions) { this.options_ = value ?? {}; this.refresh(); }

  connectedCallback(): void {
    this.root ??= this.attachShadow({ mode: "open" });
    this.#languageWatcher ??= new MutationObserver(() => this.refresh());
    this.#languageWatcher.observe(this.ownerDocument.documentElement, { attributes: true, attributeFilter: ["lang"] });
    this.refresh();
  }
  disconnectedCallback(): void {
    this.#revision += 1;
    this.mount?.destroy(); this.mount = null;
    this.#languageWatcher?.disconnect(); this.#languageWatcher = null;
  }
  attributeChangedCallback(): void { this.refresh(); }

  /** Redraw after a host changes options, coalescing attribute changes into one map load. */
  refresh(): void {
    if (!this.isConnected || this.#scheduled) return;
    this.#scheduled = true;
    queueMicrotask(() => { this.#scheduled = false; void this.#render(); });
  }
  protected tell(type: string, detail: unknown): void { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail })); }
  protected text(tag: string, value: string): HTMLElement { const element = this.ownerDocument.createElement(tag); element.textContent = value; return element; }
  protected words(en: string, ja: string): string { return this.language === "ja" ? ja : en; }

  async #render(): Promise<void> {
    const revision = ++this.#revision;
    this.removeAttribute("data-ready");
    try {
      const region = this.getAttribute("region") ?? "world";
      const map = this.options_.map ?? await loadElementMap(region);
      if (!map) throw new Error("Choose world, country-<ISO> or divisions-<ISO>.");
      const features = this.featureChoices();
      const layer = typeof this.options_.featureLayer === "function" ? await this.options_.featureLayer(map.id) : this.options_.featureLayer ?? (features.length > 0 || this.kind === "locator" ? await loadFeatures(map.id) : null);
      if (!this.isConnected || revision !== this.#revision) return;
      this.mount?.destroy(); this.mount = null;
      this.language = (this.getAttribute("lang") ?? this.options_.language ?? this.closest("[lang]")?.getAttribute("lang") ?? this.ownerDocument.documentElement.lang).toLowerCase().startsWith("ja") ? "ja" : "en";
      const theme = this.getAttribute("theme"); this.style.colorScheme = theme === "light" || theme === "dark" ? theme : "light dark";
      const width = number(this.getAttribute("width"), 0, 0, 2000);
      const sized = { small: 320, medium: 480, large: 720 }[this.getAttribute("size") ?? "medium"] ?? 480;
      this.style.width = `${width || sized}px`;
      const style = this.ownerDocument.createElement("style"); style.textContent = STYLE;
      const wrap = this.ownerDocument.createElement("div"); wrap.className = "wrap";
      if (this.getAttribute("label") !== null) { wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", this.getAttribute("label")!); }
      this.root!.replaceChildren(style, wrap);
      this.draw(wrap, map, layer, features);
      this.setAttribute("data-ready", "true");
      this.tell("chizu-load", { kind: this.kind, region: map.id, width: map.width, height: map.height });
    } catch (error) {
      if (!this.isConnected || revision !== this.#revision) return;
      this.mount?.destroy(); this.mount = null;
      const message = error instanceof Error ? error.message : String(error);
      const status = this.text("p", message); status.setAttribute("role", "status");
      this.root!.replaceChildren(status);
      this.tell("chizu-error", { kind: this.kind, message });
    }
  }
  protected featureChoices(): ChizuFeatureChoice[] {
    const asked = this.getAttribute("features");
    return asked === null ? [...(this.options_.features ?? [])] : asked === "water" || asked === "all" ? [asked] : [];
  }
  protected draw(wrap: HTMLElement, map: MapData, layer: ChizuFeatureLayer | null, features: ChizuFeatureChoice[]): void {
    const data = this.options_.data ?? readMapData(this.getAttribute("data"));
    if (data === null) throw new Error("Data must be a JSON object of finite figures keyed by region code.");
    const entries = Object.entries(data).filter(([, value]) => Number.isFinite(value));
    const figures = entries.map(([, value]) => value); const low = Math.min(...figures); const high = Math.max(...figures);
    const tones: Record<string, string> = { ...this.options_.tones };
    for (const [code, value] of entries) {
      const region = map.regions.find((one) => one.code === code || one.iso === code);
      if (region) tones[region.code] = `data-${high === low ? 2 : Math.min(4, Math.floor((value - low) / (high - low) * 5))}`;
    }
    for (const code of (this.getAttribute("highlight") ?? "").split(/[\s,]+/)) {
      const region = map.regions.find((one) => one.code === code || one.iso === code);
      if (region) tones[region.code] = "selected";
    }
    const stage = this.text("div", ""); stage.className = "map"; wrap.append(stage);
    const selectable = on(this, "selectable", this.options_.selectable ?? true);
    this.mount = mountChizu(stage, { ...this.options_, map, featureLayer: layer, features, language: this.language, tones, labels: this.hasAttribute("labels") ? on(this, "labels") : this.options_.labels, controls: on(this, "controls", this.options_.controls ?? true), selectable, zoom: Math.round(number(this.getAttribute("zoom"), this.options_.zoom ?? 1, 1, 10)) as MapZoom,
      onSelect: (code) => { const choose = wrap.querySelector("select"); if (choose) choose.value = code ?? ""; this.tell("chizu-select", { region: map.id, code }); this.options_.onSelect?.(code); }, onView: (view) => { this.tell("chizu-view", { region: map.id, ...view }); this.options_.onView?.(view); } });
    if (selectable) {
      const choose = this.ownerDocument.createElement("select"); choose.className = "choose"; choose.setAttribute("aria-label", this.words("Choose a place", "場所を選ぶ"));
      const empty = this.ownerDocument.createElement("option"); empty.value = ""; empty.textContent = this.words("Nothing chosen", "選択なし"); choose.append(empty);
      for (const region of [...map.regions.filter((one) => !one.unnamed), ...(layer ? featuresShown(layer, features) : [])]) {
        const option = this.ownerDocument.createElement("option"); option.value = region.code; option.textContent = nameOf(region, this.language); choose.append(option);
      }
      choose.addEventListener("change", () => { const code = choose.value || null; this.mount?.select(code); this.tell("chizu-select", { region: map.id, code }); this.options_.onSelect?.(code); }); wrap.append(choose);
    }
    if (figures.length) wrap.append(this.text("p", `${this.words("Figures", "数値")}: ${low}–${high}`));
  }
}

/** `<chizu-map>`: a map with highlights, labels, five-shade figures and keyboard selection. 
 *
 * @example
 * ```ts no-run
 * import { ChizuMapElement } from "@johnmorrisdotca/chizu/element";
 * const map = new ChizuMapElement();
 * map.region = "divisions-jp";
 * map.highlight = "JP-13";
 * document.body.append(map);
 * ```
 */
export class ChizuMapElement extends ChizuElement {
  /** The `region` attribute, reflected. */
  get region(): string | null { return this.getAttribute("region"); }
  set region(value: string | number | boolean | null | undefined) { write(this, "region", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { write(this, "theme", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { write(this, "size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { write(this, "width", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { write(this, "label", value); }
  /** The `highlight` attribute, reflected. */
  get highlight(): string | null { return this.getAttribute("highlight"); }
  set highlight(value: string | number | boolean | null | undefined) { write(this, "highlight", value); }
  /** The `labels` attribute, reflected. */
  get labels(): string | null { return this.getAttribute("labels"); }
  set labels(value: string | number | boolean | null | undefined) { write(this, "labels", value); }
  /** The `zoom` attribute, reflected. */
  get zoom(): string | null { return this.getAttribute("zoom"); }
  set zoom(value: string | number | boolean | null | undefined) { write(this, "zoom", value); }
  /** The `data` attribute, reflected. */
  get data(): string | null { return this.getAttribute("data"); }
  set data(value: string | number | boolean | null | undefined) { write(this, "data", value); }
  /** The `features` attribute, reflected. */
  get features(): string | null { return this.getAttribute("features"); }
  set features(value: string | number | boolean | null | undefined) { write(this, "features", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { write(this, "controls", value); }
  /** The `selectable` attribute, reflected. */
  get selectable(): string | null { return this.getAttribute("selectable"); }
  set selectable(value: string | number | boolean | null | undefined) { write(this, "selectable", value); }
  static get observedAttributes(): readonly string[] { return [...COMMON, "highlight", "labels", "zoom", "data", "features", "controls", "selectable"]; }
}

/** `<chizu-locator>`: locate a feature's id or a `latitude,longitude` pair, without contacting a geocoding service. 
 *
 * @example
 * ```ts no-run
 * import { ChizuLocator } from "@johnmorrisdotca/chizu/element";
 * const locator = new ChizuLocator();
 * locator.region = "country-jp";
 * locator.place = "Q200239";
 * document.body.append(locator);
 * ```
 */
export class ChizuLocator extends ChizuElement {
  /** The `region` attribute, reflected. */
  get region(): string | null { return this.getAttribute("region"); }
  set region(value: string | number | boolean | null | undefined) { write(this, "region", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { write(this, "theme", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { write(this, "size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { write(this, "width", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { write(this, "label", value); }
  /** The `place` attribute, reflected. */
  get place(): string | null { return this.getAttribute("place"); }
  set place(value: string | number | boolean | null | undefined) { write(this, "place", value); }
  /** The `features` attribute, reflected. */
  get features(): string | null { return this.getAttribute("features"); }
  set features(value: string | number | boolean | null | undefined) { write(this, "features", value); }
  /** The `zoom` attribute, reflected. */
  get zoom(): string | null { return this.getAttribute("zoom"); }
  set zoom(value: string | number | boolean | null | undefined) { write(this, "zoom", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { write(this, "controls", value); }
  /** The `labels` attribute, reflected. */
  get labels(): string | null { return this.getAttribute("labels"); }
  set labels(value: string | number | boolean | null | undefined) { write(this, "labels", value); }
  protected override kind = "locator" as const;
  static get observedAttributes(): readonly string[] { return [...COMMON, "place", "features", "zoom", "controls", "labels"]; }
  protected override draw(wrap: HTMLElement, map: MapData, layer: ChizuFeatureLayer | null): void {
    const place = this.getAttribute("place") ?? "35.69,139.69";
    const region = [...map.regions, ...(layer?.features ?? [])].find((one) => one.code === place || ("iso" in one && one.iso === place));
    const stage = this.text("div", ""); stage.className = "map"; wrap.append(stage);
    let point: [number, number] | null = null;
    let caption = region ? nameOf(region, this.language) : place;
    if (!region) {
      const coordinates = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/.exec(place.trim());
      const latitude = Number(coordinates?.[1]); const longitude = Number(coordinates?.[2]);
      if (!coordinates || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) throw new Error("Choose a place on this map or a latitude,longitude pair.");
      point = projectPoint(map, longitude, latitude);
      if (!point) throw new Error("Coordinate pins need the world or a country map with a known projection.");
      caption = `${latitude}, ${longitude}`;
    }
    const pin = () => {
      if (!point) return;
      const svg = stage.querySelector("svg"); if (!svg) return;
      svg.querySelector(".locator-pin")?.remove();
      const circle = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "circle"); circle.classList.add("locator-pin"); circle.setAttribute("cx", String(point[0])); circle.setAttribute("cy", String(point[1])); circle.setAttribute("r", String((this.mount?.view().box.width ?? map.width) * .008)); svg.append(circle);
    };
    this.mount = mountChizu(stage, { ...this.options_, map, featureLayer: layer, features: region && "kind" in region ? ["all"] : this.featureChoices(), selected: region?.code, fit: true, selectable: false, language: this.language, labels: on(this, "labels"), controls: on(this, "controls", true), zoom: Math.round(number(this.getAttribute("zoom"), 1, 1, 10)) as MapZoom, onView: (view) => { pin(); this.tell("chizu-view", { region: map.id, ...view }); } });
    pin();
    const text = this.text("p", caption); text.setAttribute("aria-live", "polite"); wrap.append(text);
    this.tell("chizu-locate", { region: map.id, place: region?.code ?? place, coordinates: point ? { latitude: Number(place.split(",")[0]), longitude: Number(place.split(",")[1]) } : null });
  }
}

/** `<chizu-quiz>`: repeatable questions from a seed, native answer events and no persisted score. 
 *
 * @example
 * ```ts no-run
 * import { ChizuQuiz } from "@johnmorrisdotca/chizu/element";
 * const quiz = new ChizuQuiz();
 * quiz.seed = 7;
 * quiz.addEventListener("chizu-answer", (event) => console.log((event as CustomEvent).detail));
 * document.body.append(quiz);
 * ```
 */
export class ChizuQuiz extends ChizuElement {
  /** The `region` attribute, reflected. */
  get region(): string | null { return this.getAttribute("region"); }
  set region(value: string | number | boolean | null | undefined) { write(this, "region", value); }
  /** The `theme` attribute, reflected. */
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | boolean | null | undefined) { write(this, "theme", value); }
  /** The `size` attribute, reflected. */
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | boolean | null | undefined) { write(this, "size", value); }
  /** The `width` attribute, reflected. */
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | boolean | null | undefined) { write(this, "width", value); }
  /** The `label` attribute, reflected. */
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | boolean | null | undefined) { write(this, "label", value); }
  /** The `seed` attribute, reflected. */
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | boolean | null | undefined) { write(this, "seed", value); }
  /** The `features` attribute, reflected. */
  get features(): string | null { return this.getAttribute("features"); }
  set features(value: string | number | boolean | null | undefined) { write(this, "features", value); }
  /** The `labels` attribute, reflected. */
  get labels(): string | null { return this.getAttribute("labels"); }
  set labels(value: string | number | boolean | null | undefined) { write(this, "labels", value); }
  /** The `controls` attribute, reflected. */
  get controls(): string | null { return this.getAttribute("controls"); }
  set controls(value: string | number | boolean | null | undefined) { write(this, "controls", value); }
  protected override kind = "quiz" as const;
  static get observedAttributes(): readonly string[] { return [...COMMON, "seed", "features", "labels", "controls"]; }
  #question: FindQuestion | null = null;
  #random: Random = seededRandom(1);
  #round = 0;
  protected override draw(wrap: HTMLElement, map: MapData, layer: ChizuFeatureLayer | null, features: ChizuFeatureChoice[]): void {
    const seed = Math.floor(number(this.getAttribute("seed"), 1, 0, 4294967295)); this.#random = seededRandom(seed); this.#round = 0;
    const pool = layer && features.length ? featureMap(map, layer, features) : map;
    const places = pool.regions.filter((one) => !one.unnamed);
    if (places.length < 2) throw new Error("Choose a map with at least two named places for a quiz.");
    const stage = this.text("div", ""); stage.className = "map";
    const question = this.text("p", this.words("Which place is highlighted?", "ハイライトされている場所はどこですか？"));
    const choices = this.text("div", ""); choices.className = "choices";
    const result = this.text("p", ""); result.className = "result"; result.setAttribute("aria-live", "polite");
    const next = this.text("button", this.words("Next question", "次の問題")) as HTMLButtonElement; next.type = "button";
    wrap.append(stage, question, choices, result, next);
    this.mount = mountChizu(stage, { ...this.options_, map, featureLayer: layer, features, selectable: false, language: this.language, labels: on(this, "labels"), controls: on(this, "controls", true) });
    const ask = () => {
      this.#round += 1;
      const target = places[Math.floor(this.#random() * places.length)].code;
      this.#question = findQuestion(pool, target, this.#random);
      if (!this.#question) return;
      this.mount!.set({ tones: { [target]: "selected" }, selected: null }); this.mount!.show([target]);
      choices.replaceChildren(); result.textContent = "";
      for (const code of this.#question.choices) {
        const region = places.find((one) => one.code === code) as ChizuRegion;
        const button = this.text("button", nameOf(region, this.language)) as HTMLButtonElement; button.type = "button";
        button.addEventListener("click", () => {
          const correct = code === target;
          result.textContent = this.words(correct ? "Correct." : `The answer is ${nameOf(places.find((one) => one.code === target)!, this.language)}.`, correct ? "正解です。" : `正解は${nameOf(places.find((one) => one.code === target)!, this.language)}です。`);
          for (const option of choices.querySelectorAll("button")) option.disabled = true;
          this.tell("chizu-answer", { region: map.id, target, answer: code, correct, seed, round: this.#round });
        }); choices.append(button);
      }
    };
    next.addEventListener("click", ask); ask();
  }
}

/** Register `<chizu-map>` or a host's own tag; an existing definition is preserved. 
 *
 * @example
 * ```ts no-run
 * import { defineMap } from "@johnmorrisdotca/chizu/element";
 * defineMap("article-map");
 * document.body.append(document.createElement("article-map"));
 * ```
 */
export function defineMap(tag = "chizu-map"): void { define(tag, ChizuMapElement, "chizu-map"); }
/** Register `<chizu-locator>` or a host's own tag; an existing definition is preserved. 
 *
 * @example
 * ```ts no-run
 * import { defineLocator } from "@johnmorrisdotca/chizu/element";
 * defineLocator("article-locator");
 * document.body.append(document.createElement("article-locator"));
 * ```
 */
export function defineLocator(tag = "chizu-locator"): void { define(tag, ChizuLocator, "chizu-locator"); }
/** Register `<chizu-quiz>` or a host's own tag; an existing definition is preserved. 
 *
 * @example
 * ```ts no-run
 * import { defineQuiz } from "@johnmorrisdotca/chizu/element";
 * defineQuiz("article-quiz");
 * document.body.append(document.createElement("article-quiz"));
 * ```
 */
export function defineQuiz(tag = "chizu-quiz"): void { define(tag, ChizuQuiz, "chizu-quiz"); }
function define(tag: string, Class: CustomElementConstructor, standard: string): void {
  if (typeof customElements !== "undefined" && customElements.get(tag) === undefined) customElements.define(tag, tag === standard ? Class : class extends (Class as typeof HTMLElement) {});
}

/** Browser elements for maps, located places and seeded geography questions. Importing this entry is safe on a server. */
import { ChizuElement, COMMON, number, on, write } from "./element-base.ts";
import { type ChizuFeatureChoice, featureMap } from "./features.ts";
import type { MapZoom } from "./frame.ts";
import { mountChizu } from "./mount.ts";
import { projectPoint } from "./project.ts";
import { type FindQuestion, findQuestion } from "./quiz.ts";
import { type Random, seededRandom } from "./random.ts";
import { nameOf } from "./strings.ts";
import type { ChizuFeatureLayer, ChizuRegion, ChizuMap as MapData } from "./types.ts";

export {
  CHIZU_ELEMENT_OPTION_KEYS,
  type ChizuElementOptions,
  loadElementMap,
  readMapColors,
  readMapData,
} from "./element-base.ts";

/** `<chizu-map>`: a map with highlights, labels, five-shade figures and keyboard selection.
 *
 * @example
 * ```ts no-run
 * import { ChizuMapElement } from "@johnmorrisdotca/chizu/element";
 * const map = new ChizuMapElement();
 * map.region = "divisions-jp";
 * map.highlight = "JP-13";
 * map.colors = "JP-13:#2f6b4f";
 * map.capital = false;
 * document.body.append(map);
 * ```
 */
export class ChizuMapElement extends ChizuElement {
  /** The `region` attribute, reflected. */
  get region(): string | null {
    return this.getAttribute("region");
  }
  set region(value: string | number | boolean | null | undefined) {
    write(this, "region", value);
  }
  /** The `theme` attribute, reflected. */
  get theme(): string | null {
    return this.getAttribute("theme");
  }
  set theme(value: string | number | boolean | null | undefined) {
    write(this, "theme", value);
  }
  /** The `size` attribute, reflected. */
  get size(): string | null {
    return this.getAttribute("size");
  }
  set size(value: string | number | boolean | null | undefined) {
    write(this, "size", value);
  }
  /** The `width` attribute, reflected. */
  get width(): string | null {
    return this.getAttribute("width");
  }
  set width(value: string | number | boolean | null | undefined) {
    write(this, "width", value);
  }
  /** The `label` attribute, reflected. */
  get label(): string | null {
    return this.getAttribute("label");
  }
  set label(value: string | number | boolean | null | undefined) {
    write(this, "label", value);
  }
  /** The `highlight` attribute, reflected. */
  get highlight(): string | null {
    return this.getAttribute("highlight");
  }
  set highlight(value: string | number | boolean | null | undefined) {
    write(this, "highlight", value);
  }
  /** The `labels` attribute, reflected. */
  get labels(): string | null {
    return this.getAttribute("labels");
  }
  set labels(value: string | number | boolean | null | undefined) {
    write(this, "labels", value);
  }
  /** The `zoom` attribute, reflected. */
  get zoom(): string | null {
    return this.getAttribute("zoom");
  }
  set zoom(value: string | number | boolean | null | undefined) {
    write(this, "zoom", value);
  }
  /** The `data` attribute, reflected. */
  get data(): string | null {
    return this.getAttribute("data");
  }
  set data(value: string | number | boolean | null | undefined) {
    write(this, "data", value);
  }
  /** The `features` attribute, reflected. */
  get features(): string | null {
    return this.getAttribute("features");
  }
  set features(value: string | number | boolean | null | undefined) {
    write(this, "features", value);
  }
  /** The `controls` attribute, reflected. */
  get controls(): string | null {
    return this.getAttribute("controls");
  }
  set controls(value: string | number | boolean | null | undefined) {
    write(this, "controls", value);
  }
  /** The `selectable` attribute, reflected. */
  get selectable(): string | null {
    return this.getAttribute("selectable");
  }
  set selectable(value: string | number | boolean | null | undefined) {
    write(this, "selectable", value);
  }
  static get observedAttributes(): readonly string[] {
    return [
      ...COMMON,
      "capital",
      "highlight",
      "labels",
      "zoom",
      "data",
      "features",
      "controls",
      "selectable",
      "cities",
    ];
  }
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
  get region(): string | null {
    return this.getAttribute("region");
  }
  set region(value: string | number | boolean | null | undefined) {
    write(this, "region", value);
  }
  /** The `theme` attribute, reflected. */
  get theme(): string | null {
    return this.getAttribute("theme");
  }
  set theme(value: string | number | boolean | null | undefined) {
    write(this, "theme", value);
  }
  /** The `size` attribute, reflected. */
  get size(): string | null {
    return this.getAttribute("size");
  }
  set size(value: string | number | boolean | null | undefined) {
    write(this, "size", value);
  }
  /** The `width` attribute, reflected. */
  get width(): string | null {
    return this.getAttribute("width");
  }
  set width(value: string | number | boolean | null | undefined) {
    write(this, "width", value);
  }
  /** The `label` attribute, reflected. */
  get label(): string | null {
    return this.getAttribute("label");
  }
  set label(value: string | number | boolean | null | undefined) {
    write(this, "label", value);
  }
  /** The `place` attribute, reflected. */
  get place(): string | null {
    return this.getAttribute("place");
  }
  set place(value: string | number | boolean | null | undefined) {
    write(this, "place", value);
  }
  /** The `features` attribute, reflected. */
  get features(): string | null {
    return this.getAttribute("features");
  }
  set features(value: string | number | boolean | null | undefined) {
    write(this, "features", value);
  }
  /** The `zoom` attribute, reflected. */
  get zoom(): string | null {
    return this.getAttribute("zoom");
  }
  set zoom(value: string | number | boolean | null | undefined) {
    write(this, "zoom", value);
  }
  /** The `controls` attribute, reflected. */
  get controls(): string | null {
    return this.getAttribute("controls");
  }
  set controls(value: string | number | boolean | null | undefined) {
    write(this, "controls", value);
  }
  /** The `labels` attribute, reflected. */
  get labels(): string | null {
    return this.getAttribute("labels");
  }
  set labels(value: string | number | boolean | null | undefined) {
    write(this, "labels", value);
  }
  protected override kind = "locator" as const;
  static get observedAttributes(): readonly string[] {
    return [...COMMON, "capital", "place", "features", "zoom", "controls", "labels"];
  }
  protected override draw(wrap: HTMLElement, map: MapData, layer: ChizuFeatureLayer | null): void {
    const place = this.getAttribute("place") ?? "35.69,139.69";
    const region = [...map.regions, ...(layer?.features ?? [])].find(
      (one) => one.code === place || ("iso" in one && one.iso === place),
    );
    const stage = this.text("div", "");
    stage.className = "map";
    wrap.append(stage);
    let point: [number, number] | null = null;
    let caption = region ? nameOf(region, this.language) : place;
    if (!region) {
      const coordinates = /^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/.exec(place.trim());
      const latitude = Number(coordinates?.[1]);
      const longitude = Number(coordinates?.[2]);
      if (!coordinates || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
        throw new Error("Choose a place on this map or a latitude,longitude pair.");
      point = projectPoint(map, longitude, latitude);
      if (!point) throw new Error("Coordinate pins need the world or a country map with a known projection.");
      caption = `${latitude}, ${longitude}`;
    }
    const pin = () => {
      if (!point) return;
      const svg = stage.querySelector("svg");
      if (!svg) return;
      svg.querySelector(".locator-pin")?.remove();
      const circle = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.classList.add("locator-pin");
      circle.setAttribute("cx", String(point[0]));
      circle.setAttribute("cy", String(point[1]));
      circle.setAttribute("r", String((this.mount?.view().box.width ?? map.width) * 0.008));
      svg.append(circle);
    };
    this.mount = mountChizu(stage, {
      ...this.options_,
      colors: this.colourOptions(map),
      map,
      featureLayer: layer,
      features: region && "kind" in region ? ["all"] : this.featureChoices(),
      selected: region?.code,
      fit: true,
      selectable: false,
      language: this.language,
      labels: on(this, "labels"),
      controls: on(this, "controls", true),
      zoom: Math.round(number(this.getAttribute("zoom"), 1, 1, 10)) as MapZoom,
      onView: (view) => {
        pin();
        this.tell("chizu-view", { region: map.id, ...view });
      },
    });
    pin();
    const text = this.text("p", caption);
    text.setAttribute("aria-live", "polite");
    wrap.append(text);
    this.tell("chizu-locate", {
      region: map.id,
      place: region?.code ?? place,
      coordinates: point ? { latitude: Number(place.split(",")[0]), longitude: Number(place.split(",")[1]) } : null,
    });
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
  get region(): string | null {
    return this.getAttribute("region");
  }
  set region(value: string | number | boolean | null | undefined) {
    write(this, "region", value);
  }
  /** The `theme` attribute, reflected. */
  get theme(): string | null {
    return this.getAttribute("theme");
  }
  set theme(value: string | number | boolean | null | undefined) {
    write(this, "theme", value);
  }
  /** The `size` attribute, reflected. */
  get size(): string | null {
    return this.getAttribute("size");
  }
  set size(value: string | number | boolean | null | undefined) {
    write(this, "size", value);
  }
  /** The `width` attribute, reflected. */
  get width(): string | null {
    return this.getAttribute("width");
  }
  set width(value: string | number | boolean | null | undefined) {
    write(this, "width", value);
  }
  /** The `label` attribute, reflected. */
  get label(): string | null {
    return this.getAttribute("label");
  }
  set label(value: string | number | boolean | null | undefined) {
    write(this, "label", value);
  }
  /** The `seed` attribute, reflected. */
  get seed(): string | null {
    return this.getAttribute("seed");
  }
  set seed(value: string | number | boolean | null | undefined) {
    write(this, "seed", value);
  }
  /** The `features` attribute, reflected. */
  get features(): string | null {
    return this.getAttribute("features");
  }
  set features(value: string | number | boolean | null | undefined) {
    write(this, "features", value);
  }
  /** The `labels` attribute, reflected. */
  get labels(): string | null {
    return this.getAttribute("labels");
  }
  set labels(value: string | number | boolean | null | undefined) {
    write(this, "labels", value);
  }
  /** The `controls` attribute, reflected. */
  get controls(): string | null {
    return this.getAttribute("controls");
  }
  set controls(value: string | number | boolean | null | undefined) {
    write(this, "controls", value);
  }
  protected override kind = "quiz" as const;
  static get observedAttributes(): readonly string[] {
    return [...COMMON, "seed", "features", "labels", "controls"];
  }
  #question: FindQuestion | null = null;
  #random: Random = seededRandom(1);
  #round = 0;
  protected override draw(
    wrap: HTMLElement,
    map: MapData,
    layer: ChizuFeatureLayer | null,
    features: ChizuFeatureChoice[],
  ): void {
    const seed = Math.floor(number(this.getAttribute("seed"), 1, 0, 4294967295));
    this.#random = seededRandom(seed);
    this.#round = 0;
    const pool = layer && features.length ? featureMap(map, layer, features) : map;
    const places = pool.regions.filter((one) => !one.unnamed);
    if (places.length < 2) throw new Error("Choose a map with at least two named places for a quiz.");
    const stage = this.text("div", "");
    stage.className = "map";
    const question = this.text(
      "p",
      this.words("Which place is highlighted?", "ハイライトされている場所はどこですか？"),
    );
    const choices = this.text("div", "");
    choices.className = "choices";
    const result = this.text("p", "");
    result.className = "result";
    result.setAttribute("aria-live", "polite");
    const next = this.text("button", this.words("Next question", "次の問題")) as HTMLButtonElement;
    next.type = "button";
    wrap.append(stage, question, choices, result, next);
    this.mount = mountChizu(stage, {
      ...this.options_,
      colors: this.colourOptions(map),
      map,
      featureLayer: layer,
      features,
      selectable: false,
      language: this.language,
      labels: on(this, "labels"),
      controls: on(this, "controls", true),
    });
    const ask = () => {
      this.#round += 1;
      const place = places[Math.floor(this.#random() * places.length)];
      if (place === undefined) throw new Error("a quiz round needs a place");
      const target = place.code;
      this.#question = findQuestion(pool, target, this.#random);
      if (!this.#question) return;
      this.mount!.set({ tones: { [target]: "selected" }, selected: null });
      this.mount!.show([target]);
      choices.replaceChildren();
      result.textContent = "";
      for (const code of this.#question.choices) {
        const region = places.find((one) => one.code === code) as ChizuRegion;
        const button = this.text("button", nameOf(region, this.language)) as HTMLButtonElement;
        button.type = "button";
        button.addEventListener("click", () => {
          const correct = code === target;
          result.textContent = this.words(
            correct
              ? "Correct."
              : `The answer is ${nameOf(places.find((one) => one.code === target)!, this.language)}.`,
            correct ? "正解です。" : `正解は${nameOf(places.find((one) => one.code === target)!, this.language)}です。`,
          );
          for (const option of choices.querySelectorAll("button")) option.disabled = true;
          this.tell("chizu-answer", { region: map.id, target, answer: code, correct, seed, round: this.#round });
        });
        choices.append(button);
      }
    };
    next.addEventListener("click", ask);
    ask();
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
 * @param tag - The custom tag name; omitted to use the package default.
 * @returns Nothing; existing definitions and server imports remain safe.
 */
export function defineMap(tag = "chizu-map"): void {
  define(tag, ChizuMapElement, "chizu-map");
}
/** Register `<chizu-locator>` or a host's own tag; an existing definition is preserved.
 *
 * @example
 * ```ts no-run
 * import { defineLocator } from "@johnmorrisdotca/chizu/element";
 * defineLocator("article-locator");
 * document.body.append(document.createElement("article-locator"));
 * ```
 * @param tag - The custom tag name; omitted to use the package default.
 * @returns Nothing; existing definitions and server imports remain safe.
 */
export function defineLocator(tag = "chizu-locator"): void {
  define(tag, ChizuLocator, "chizu-locator");
}
/** Register `<chizu-quiz>` or a host's own tag; an existing definition is preserved.
 *
 * @example
 * ```ts no-run
 * import { defineQuiz } from "@johnmorrisdotca/chizu/element";
 * defineQuiz("article-quiz");
 * document.body.append(document.createElement("article-quiz"));
 * ```
 * @param tag - The custom tag name; omitted to use the package default.
 * @returns Nothing; existing definitions and server imports remain safe.
 */
export function defineQuiz(tag = "chizu-quiz"): void {
  define(tag, ChizuQuiz, "chizu-quiz");
}
function define(tag: string, Class: CustomElementConstructor, standard: string): void {
  if (typeof customElements !== "undefined" && customElements.get(tag) === undefined)
    customElements.define(tag, tag === standard ? Class : class extends (Class as typeof HTMLElement) {});
}

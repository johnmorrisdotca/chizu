# Embed a map, a located place or a quiz

[Open the builder](https://johnmorrisdotca.github.io/chizu/builder.html) to preview each element and copy a custom element, iframe, ES module, React 19, Vue, Svelte, Angular, plain HTML block or iframe URL. The builder link carries its options. The iframe pages load built-in maps and named features from their own site, store nothing, and never contact a geocoding service. The npm pin comes from the current package major.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/chizu@1/dist/element-define.js"></script>
<chizu-map region="world" highlight="JP CA" labels></chizu-map>
<chizu-locator region="country-jp" place="Q200239"></chizu-locator>
<chizu-quiz region="divisions-jp" seed="7"></chizu-quiz>
```

The `@johnmorrisdotca/chizu/element` entry exports the three classes, `ChizuMapElement`, `ChizuLocator` and `ChizuQuiz`, and `defineMap(tag?)`, `defineLocator(tag?)` and `defineQuiz(tag?)` for standard or custom tags. A definition already registered is preserved, and importing either element entry on a server is safe. Custom map data stays on `options.map`.

| Shared attribute | Values and default |
| --- | --- |
| `region` | `world` (default), `country-<ISO>` or `divisions-<ISO>`; country codes come from the load entry |
| `lang` | `en` or `ja`; defaults to the nearest language or the page language |
| `theme` | `light`, `dark`, `auto` (default); each element's own theme also works inside shadow DOM |
| `size` | `small`, `medium`, `large`; widths 320, 480 and 720 pixels, medium by default |
| `width` | explicit pixel width, fitting a narrower parent |
| `label` | optional spoken label; text rather than markup |
| `features` | `none` (default), `water` or `all`; host `options.features` can choose individual kinds |
| `labels` | print region names; off by default |
| `controls` | zoom buttons; on by default |

| Element | Additional attributes |
| --- | --- |
| `<chizu-map>` | `highlight`: codes or ISO codes separated by spaces; `zoom`: 1–10; `data`: JSON object of finite figures keyed by code or ISO code; `selectable`: on by default |
| `<chizu-locator>` | `place`: a region/feature code on the map, such as `Q200239` (Lake Biwa) on `country-jp`, or a `latitude,longitude` pair; `zoom`: 1–10 for a coordinate pin |
| `<chizu-quiz>` | `seed`: integer 0–4294967295, default 1; each next question comes from the same seeded sequence |

Every observed attribute is reflected as a property. Native `lang` retains its browser property. Booleans accept `off`, `false`, `no` and `0`; assigning `false` writes the off value, and `null` or `undefined` removes an attribute. The host-only `options` property accepts existing mounted-map options and a `data` object; the builder lists every attribute or explains why an option belongs to host code. Assigning options or changing an attribute redraws the element. Disconnecting destroys the mounted map; a late map load cannot replace a newer configuration.

Figures use five equal intervals from the lowest to the highest value; equal figures use the middle shade. Unmatched codes are ignored. Labels and numbers remain available in text; colour is an additional cue. The map provides an ordinary select list for keyboard selection alongside the mounted map's existing pan and zoom keys. The quiz uses ordinary buttons and announces its answer. A locator pin takes coordinates supplied by the host; it never requests a visitor's location. Coordinate pins require the world or a country map with a known projection; division maps reject coordinate pins. Named locators use existing framing and water layers.

The iframe routes are `embed/`, `embed/locator/` and `embed/quiz/`. Query keys are the attribute names. Choices, numbers, codes and figure objects are validated, and invalid parameters are ignored. A place not on the chosen map is reported plainly. The builder updates frame height once its map loads, so maps of different proportions keep their natural aspect ratio with no inner scrolling. The pages are transparent, `noindex`, and support light and dark colour schemes. Reduced motion is inherited from the static drawing and existing mounted-map controls.

| Event | JSON-safe detail |
| --- | --- |
| `chizu-load` | `{ kind, region, width, height }` |
| `chizu-error` | `{ kind, message }` |
| `chizu-select` | `{ region, code }`; null clears a selection |
| `chizu-view` | `{ region, zoom, centre, box }` |
| `chizu-locate` | `{ region, place, coordinates }`; coordinates are `{ latitude, longitude }` or null for a named place |
| `chizu-answer` | `{ region, target, answer, correct, seed, round }` |

All events bubble and cross shadow boundaries. The iframe forwards the identical detail in `{ type: event.type, detail: event.detail }`. A host must check both `event.origin === "https://johnmorrisdotca.github.io"` and `event.source === iframe.contentWindow` before using a message. No event includes visitor identity or persisted scores.

Native released options remain available through the host options property,
including colors, onSelect and onView. Callback details are the native values;
DOM events still bubble and compose with JSON-safe details. Map/feature labels
use the released country-specific kind names and capital-inset projection.

## Colours and capital markers

`colors="JP:#2f6b4f,GB:#8a3b3b"` uses native Chizu colours per region/ISO code. Commas inside `rgb()`/`hsl()` are retained; CSS names and `var(--name)` use the native colour validator. Invalid pairs are rejected, never inserted into a style. The host can still set `options.colors`; a present attribute overrides that map. `readMapColors(text)` returns the validated map or null.

Map and locator embeds now show capital markers by default. `capital="off"` (also false/no/0) removes their feature shapes even with `features="all"`; `capital="on"` adds them alongside water or other selected features. The property is boolean and reflected. `options.capital` supplies a host default. Native `drawChizu` and `mountChizu` keep their existing feature defaults; quiz question pools stay unchanged. Quiz colours remain available, while capital controls belong to map/locator builders. Frames validate both settings; builder code and copied links restore them.

```html
<chizu-map region="world" colors="JP:#2f6b4f,GB:#8a3b3b" capital="off"></chizu-map>
```

[Japanese colour/marker guide](embed-colours-ja.md).

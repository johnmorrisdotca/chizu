# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.2] - 2026-10-06

Nothing that was exported has changed. The README is the family's one layout, in full.

### Added

- The README has a picture of the demo on a desk and on a phone, in light and dark, taken from the demo by `pnpm screenshots:readme` (the pictures are in `docs/images/` and are not in the package), a picture for each kind of map (explore, callouts, insets, one country alone, the quiz), an Examples section of eleven examples that run, examples for React, Vue, Svelte and Angular, and an Accessibility section.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, as a job of its own in CI; `src/readme.test.js` holds the README to the family's standard (sections in order, languages on code fences, pictures with alt text and a caption, no marketing words, version pins) in `pnpm check`; `pnpm test:package` fails if a picture or anything under `docs/` is in the packed package.

### Changed

- The README no longer says the mounted map can be pressed "by keyboard": the keyboard moves and zooms it, and choosing a place needs a pointer or a list of the page's own that calls `select` (the Accessibility section says so).
- `pnpm pictures` is `pnpm screenshots:readme`, and takes WebP pictures in light and dark under `docs/images/`; `docs/desktop.jpg` and `docs/phone.jpg` are gone.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Chizu, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.

### Fixed

- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [1.0.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/chizu@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.

## [1.0.0] - 2026-10-01

The map engine of a Japanese study app and the world of Itsutsu's geography, made into a package that both import.

- **Maps from Natural Earth** (public domain, release 5.1.2), made by `scripts/build-data.mjs`, which checks each file against its SHA-256 and writes the same bytes every time:
  `@johnmorrisdotca/chizu/world` (173 countries, one canvas, Miller's projection centred on 155°E), `countries/<code>` (238 countries
  each alone, 1:50m and 1:10m for the small ones), `divisions/<code>` (the regions of 31 countries, 1:10m), and `names` (every country
  in English and Japanese, with the everyday short name and the reading in kana).
- **`@johnmorrisdotca/chizu`**, the engine: windows, five zoom steps, fits and shape frames (`zoomBox`, `focusBox`, `regionBox`, `zoomToFit`,
  `shapeGlyphBox`); insets (Alaska and Hawaii in boxes of their own); a world that goes round (`wrapOffsets`, `wrapIntoBox`); outlines as
  rings with a point on each region's land; `layoutCallouts`, numbered circles in open water with leader lines that never cross, and its
  parts (`placeCallouts`, `calloutSpaces`, `calloutFaults`); `findQuestion` and `pickDistractors`; `placesFromText`; `projectPoint` and
  `unprojectPoint`, held to d3-geo's own; the words in English and Japanese.
- **`@johnmorrisdotca/chizu/draw`**: a map as SVG text, with tones, labels, insets in dashed frames and numbered callouts, in light and dark.
- **`@johnmorrisdotca/chizu/mount`**: `mountChizu`, a map to drag, zoom in five steps and press, by touch, mouse and keyboard, in English and Japanese.
- **`@johnmorrisdotca/chizu/load`**: `loadCountry` and `loadDivisions`, one dynamic import for each file.
- A demo with a map to explore, a which-one-is-this quiz and the callout placer, a Help switch, the cloth patches, and browser tests
  (`pnpm test:demo`) at a phone's width and a desk's, in Chromium and WebKit.

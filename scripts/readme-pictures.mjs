// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and the same each run: the map and the mode
// are named by the address, the callouts are placed by the package from the map alone, the quiz has a seed, and motion is
// reduced. It waits on the map's own svg and the page's ready mark, never on a clock.
// Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const READY = '[data-testid="board"][data-ready="true"] svg.chizu';
const CALLOUTS = `${READY} .cz-callout`;
const board = '[data-testid="board"]';
const address = (query) => `/?lang=en&help=off&${query}`;

/** Scroll the page so that an element is at the top. */
const scrollTo = (selector) => (page) =>
  page
    .locator(selector)
    .evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 4));

await takePictures({
  shots: [
    // The world with twenty countries numbered, on a desk, from the top of the page. On a phone: Germany's sixteen states in Japanese, scrolled to the map.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: address("mode=callouts&map=world"),
      height: 1000,
      ready: CALLOUTS,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto("http://chizu.test/?lang=ja&help=off&mode=callouts&map=divisions:de");
          await page.waitForSelector(CALLOUTS);
          await scrollTo(board)(page);
        } else await page.evaluate(() => window.scrollTo(0, 0));
        await page.mouse.move(0, 0);
      },
    },
    // Explore: Japan chosen on the world, which is drawn with Japan in the middle and goes round without a seam.
    {
      subject: "explore",
      views: ["desk"],
      url: address("map=world&mode=explore&select=JP"),
      ready: READY,
      target: board,
    },
    // A question: one country lit, four look-alikes to choose from.
    {
      subject: "quiz",
      views: ["phone"],
      url: address("map=world&mode=quiz&seed=3"),
      ready: READY,
      async prepare(page) {
        await page.waitForSelector('[data-testid="choices"] button');
        await scrollTo(board)(page);
      },
    },
    // Germany's sixteen states with numbered callouts in the open space around them.
    {
      subject: "callouts",
      views: ["desk"],
      url: address("mode=callouts&map=divisions:de"),
      ready: CALLOUTS,
      target: board,
    },
    // The United States with Alaska and Hawaii in boxes of their own under the lower forty-eight.
    { subject: "insets", views: ["desk"], url: address("mode=explore&map=divisions:us"), ready: READY, target: board },
    // Japan's 47 prefectures, each of the eight regions a Japanese school teaches in a colour of its own.
    { subject: "japan", views: ["desk"], url: address("mode=colour&colour=groups"), ready: READY, target: board },
    // One country alone, from the 1:50m outlines, with its seas, lake and rivers drawn and named.
    {
      subject: "country",
      views: ["phone"],
      url: address("mode=explore&map=country:jp&features=water"),
      ready: `${READY} .cz-feature-label`,
      target: board,
    },
  ],
  // The family's thumbnail, dark thumbnail and icon (scripts/family-thumbnail.mjs): the world with Japan in the middle,
  // each continent in a colour of its own; the icon is Japan's 47 prefectures in the colours of its eight regions,
  // the main islands alone (the sea and the boxes of the far islands left out).
  thumbnail: {
    url: address("map=world&mode=colour&colour=groups"),
    ready: READY,
    target: `${board} svg.chizu`,
    icon: {
      url: address("mode=colour&colour=groups"),
      async prepare(page) {
        await page.locator(`${board} svg.chizu`).evaluate((map) => {
          // A mask that is the whole map less the boxes, so the islands drawn in the boxes go with them.
          const ns = "http://www.w3.org/2000/svg";
          const mask = document.createElementNS(ns, "mask");
          mask.id = "thumbnail-no-insets";
          const [, , width, height] = map.getAttribute("viewBox").split(" ").map(Number);
          const rect = (x, y, w, h, fill) => {
            const shape = document.createElementNS(ns, "rect");
            for (const [name, value] of Object.entries({ x, y, width: w, height: h, fill }))
              shape.setAttribute(name, value);
            return shape;
          };
          mask.append(rect(0, 0, width, height, "white"));
          for (const inset of map.querySelectorAll(".cz-inset")) {
            const box = inset.getBBox();
            mask.append(rect(box.x, box.y, box.width, box.height, "black"));
            inset.style.setProperty("display", "none");
          }
          map.append(mask);
          for (const region of map.querySelectorAll(".cz-region"))
            region.setAttribute("mask", "url(#thumbnail-no-insets)");
          for (const sea of map.querySelectorAll(".cz-sea")) sea.style.setProperty("display", "none");
          map.style.setProperty("width", "640px", "important");
          map.style.setProperty("height", "auto", "important");
        });
      },
    },
    label: "Chizu 地図",
  },
});

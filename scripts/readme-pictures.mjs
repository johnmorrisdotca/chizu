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
const scrollTo = (selector) => (page) => page.locator(selector).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 4));

await takePictures({
  shots: [
    // The world with twenty countries numbered, on a desk, from the top of the page. On a phone: Germany's sixteen states in Japanese, scrolled to the map.
    {
      subject: "hero",
      views: ["desk", "phone"],
      url: address("mode=callouts"),
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
    { subject: "explore", views: ["desk"], url: address("mode=explore&select=JP"), ready: READY, target: board },
    // A question: one country lit, four look-alikes to choose from.
    { subject: "quiz", views: ["phone"], url: address("mode=quiz&seed=3"), ready: READY, async prepare(page) {
        await page.waitForSelector('[data-testid="choices"] button');
        await scrollTo(board)(page);
      },
    },
    // Germany's sixteen states with numbered callouts in the open space around them.
    { subject: "callouts", views: ["desk"], url: address("mode=callouts&map=divisions:de"), ready: CALLOUTS, target: board },
    // The United States with Alaska and Hawaii in boxes of their own under the lower forty-eight.
    { subject: "insets", views: ["desk"], url: address("mode=explore&map=divisions:us"), ready: READY, target: board },
    // One country alone, from the 1:50m outlines.
    { subject: "country", views: ["phone"], url: address("mode=explore&map=country:jp"), ready: READY, target: board },
  ],
});

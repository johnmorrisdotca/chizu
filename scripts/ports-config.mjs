// What the airports and harbours are made from, and the numbers that choose them: read by wikidata-ports.mjs and
// build-ports.mjs. The sources and what each one's terms say are in NOTICE.md.

/** The airports kept, and where each tier ends: the first 150 by passengers, the first 300, the first 600. */
export const AIRPORT_TIERS = [150, 300, 600];

/** How many of the busiest airports Wikidata is asked about, so that a few left out below still leave AIRPORT_TIERS' last. */
export const AIRPORT_POOL = 700;

/** Passenger figures from this year on count; each airport is ranked by its highest, so a closed year (2020) never ranks it. */
export const FIRST_YEAR = 2015;

/** Items that hold a passenger figure and are not an airport's traffic, left out with the reason. */
export const NOT_TRAFFIC = {
  Q115481355: "King Salman International Airport: the figure is a plan for an airport not yet open",
};

/** A harbour's tier from Natural Earth's scalerank (3 the largest, 8 the smallest): up to 4, then 5, then 6 and below. */
export const HARBOUR_TIER_RANKS = [4, 5];

/** How far from Natural Earth's point a Wikidata item may lie, in kilometres, to be the same harbour. */
export const PORT_MATCH_KM = 60;
export const PLACE_MATCH_KM = 40;

/** A country's polygon this close to a harbour's point is the harbour's country, where the point lies on its shore. */
export const SHORE_KM = 100;

/** The country of a place whose point lies more than SHORE_KM from any 1:50m outline: an island that file leaves off. */
export const COUNTRY_FIXES = {
  adz: "CO",
  lampedusa: "IT",
};

/** The one Natural Earth file only the ports read, held to its hash like the others (data-config.mjs's, which `pnpm data` reads, are nine and stay so). */
export const PORTS_FILES = {
  "ne_10m_ports.geojson": "c5a5028f5187a5e1b9fe7f0fab99804a8be7482099a2365d404fb7e9dd6b5457",
};

/**
 * OurAirports' open data (public domain: its repository's LICENSE is the Unlicense), at one commit so that the runways are
 * made the same every time: each file is fetched once into the cache from this commit and checked against its SHA-256.
 */
export const OURAIRPORTS = {
  repository: "https://github.com/davidmegginson/ourairports-data",
  commit: "13c732d99cd8a0147f3a42533bff671bcb8000cf",
  /** The day that commit was made and read. */
  retrieved: "2026-11-18",
  files: {
    "airports.csv": "8d406ed66ccc287f75b718a6681fa73d080ba61332bad47abf46bd3e21171558",
    "runways.csv": "eb3d10aa1809a1fc36f7d66c6a52b1b6fe887b14e857c6405c6208961d86e66b",
    LICENSE: "6b0382b16279f26ff69014300541967a356a666eb0b91b422f6862f6b7dad17e",
  },
};

/** An OurAirports airport is the shipped one when its point lies within this many kilometres of Wikidata's. */
export const RUNWAY_MATCH_KM = 15;

/** Feet to metres, for the length and width OurAirports gives in feet. */
export const METRES_PER_FOOT = 0.3048;

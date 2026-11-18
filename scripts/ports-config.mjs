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

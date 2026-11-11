// The demo's Cities switch: kuni's cities, bundled with the site (site/cities/) and fetched the first time they are
// turned on, kept in the address as cities=on.

const loadDemoCities = () => import("./cities/kuni-cities.js").then((entry) => entry.loadKuniCities());

/** What the mounted map is told of the cities, with the switch on or off. */
export const cityOptions = (on) => ({ cities: on ? loadDemoCities : null });

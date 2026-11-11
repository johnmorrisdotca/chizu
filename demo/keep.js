// What the demo keeps in the browser between visits (the quiz's best streak): read and written through these, so a
// browser that keeps nothing (a private window, blocked storage) costs only the keeping.
export const keep = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* A browser that keeps nothing: the best streak lasts the visit. */
    }
  },
};

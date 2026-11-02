# Roadmap

Not here yet, and each welcome as an [issue](https://github.com/johnmorrisdotca/chizu/issues):

- **The outlines as longitude and latitude**, an entry of their own, so that another map can be made from them in another projection or cut at another meridian: [Tenka](https://github.com/johnmorrisdotca/tenka) cuts its world at the Bering Strait and merges countries into territories, which a canvas that is already projected cannot do.
- **Cities on the country maps**: Natural Earth's populated places, projected on each canvas, for pinning a town.
- **More named water**: Natural Earth's regional supplements of lakes and rivers, and the bays and rivers it does not draw at 1:10m (Tokyo Bay, the Shinano).
- **Readings for the regions outside Japan**, when kuni has them.
- A **US-style composite** (Albers USA) as an alternative to the two boxes.
- A **tag** (`<chizu-map>`) beside `mountChizu`, as the other packages of the family have.

Left out on purpose: population, area, mottos and "famous for" facts. They are claims, and a map should not make them without a source for each; where kuni carries one with its source, Chizu reads it at build time.


# Names and data to fix upstream

chizu does not edit its sources to suit itself: a name or a fact that looks wrong is listed here, with where it comes
from, so it can be fixed where it is made (Natural Earth, Wikidata or kuni) and then arrives here on the next data
build. Nothing below has been changed in chizu's data, except where a line says so. Checked 2026-10-09.

**The Japanese in this list has not been reviewed by a native reader.** Each entry says what looks wrong; none is
a confirmed error until a native reader says so.

| Where it shows | Source | What looks wrong | What to ask upstream |
| --- | --- | --- | --- |
| The peak Nganglong Kangri (`Q4062402`, 6,720 m; named Nganglong Mountains in English) is named 港龍崗日 on the world, China and China's provinces | Natural Earth, `name_ja` of the point in the elevation-points file | Not a name Japanese references use. The Chinese name of the peak is 昂龙冈日 (昂龍崗日 in traditional characters), so 港 where 昂 belongs looks like a conversion slip, and a Japanese reference would write the Tibetan name in katakana. Wikidata has no Japanese label for the item | Natural Earth: check `name_ja` of this point. Wikidata: a Japanese label would let chizu stop using Natural Earth's |
| The river Irtysh (`Q128102`) is named エルティシ川 | Wikidata, Japanese label | Probably not an error: Japanese Wikipedia's own article is titled エルティシ川. Other Japanese texts write イルティシュ川, イルティシ川 or イルトィシュ川, and エルティシ is the sound of the Kazakh name (Ertis) and the Chinese (额尔齐斯, Ěrqísī) rather than the Russian one. Listed because it looked odd | None unless a native reader says it should change |
| The Canadian Shield (`Q76034`, カナダ楯状地) is a feature of kind `tundra` on Canada's and the United States' maps and the world | Natural Earth, `featurecla` "Tundra" of its geography-regions file (the Guiana Shield in the same file is a "Plateau") | A shield is a geological region (a craton, 楯状地), not a kind of vegetation; the Shield is mostly forest, with tundra only in its north | Natural Earth: ask for the class of this polygon; until then chizu follows Natural Earth's class, which is why the kind reads Tundra (ツンドラ) on its card |
| Alaska's capital, Juneau, is absent from kuni | kuni 1.1.0, `/subdivision-facts` (`US-AK`: `capital` and `capitalPoint` are null) | Every other state has a capital there; Alaska has none | kuni: add the capital and its point for `US-AK`. **chizu writes Juneau itself** (`SEATS_KUNI_LACKS` in `scripts/features-config.mjs`, with the Japanese name ジュノー, for review) so that Alaska's box has its seat; the build stops when kuni gains one, so the entry is then removed |

## Words chizu itself chose

These are chizu's own and need no upstream fix, but are written down because they were decided on evidence.

- **Lagoon in Japanese is 潟湖.** The Geospatial Information Authority's terrain-features pages (国土地理院, 海の作用による地形) head the
  entry 潟湖（ラグーン）, and Japanese dictionaries (デジタル大辞泉, 精選版 日本国語大辞典, 日本大百科全書) define 潟湖 as the lake
  made when a bay is cut off from the sea by sandbars and say it is "also called ラグーン". Japanese Wikipedia titles the
  article ラグーン and treats 潟湖 (sandbar lagoons) and 礁湖 (reef lagoons) as its two kinds. The lagoons Natural Earth
  names (the Szczecin Lagoon, the Patos Lagoon) are sandbar lagoons, so 潟湖 is the exact word and the geography
  reference's own; ラグーン is the everyday word, and a page that prefers it can replace `kind.lagoon` in `CHIZU_STRINGS`.
- **A region's seat on a map of Japan is 県庁所在地** (`kind.seat.JP`), and 行政の中心地 on every other map. See
  docs/features.md.

import { ENDING_READINGS, FEATURE_READINGS, LEADING_READINGS } from "../features-config.mjs";

// ---- Names and readings ------------------------------------------------------------------------------------------

/** Katakana as hiragana; the long-vowel mark stays as it is. */
const toHiragana = (text) => text.replace(/[ァ-ヶ]/gu, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
const KANA = /^[\p{Script=Katakana}\p{Script=Hiragana}ー]+$/u;
/** A name with its middle dots, spaces and bracketed asides taken out. */
const bare = (name) => name.replace(/\s*[(（][^)）]*[)）]\s*/gu, "").replace(/[・･＝=\s]/gu, "");

/**
 * How a Japanese name is read, and where the reading came from: a name in kana is its own reading; Wikidata's name in
 * kana (P1814); the table written here; a Japanese alias in hiragana alone; or kana followed by a known ending (カスピ海,
 * かすぴかい), with a direction before it (南シナ海). Null when none of these reads it.
 */
export function featureReading(nameJa, item) {
  if (!nameJa) return null;
  const plain = bare(nameJa);
  if (KANA.test(plain)) return { reading: plain, from: "kana" };
  const kana = item?.kana?.map((one) => toHiragana(bare(one))).find((one) => KANA.test(one));
  if (kana) return { reading: kana, from: "wikidata" };
  if (FEATURE_READINGS[plain]) return { reading: FEATURE_READINGS[plain], from: "table" };
  const alias = item?.hiragana?.map(bare).find((one) => KANA.test(one));
  if (alias) return { reading: alias, from: "wikidata" };
  for (const [ending, said] of ENDING_READINGS) {
    if (!plain.endsWith(ending)) continue;
    let head = plain.slice(0, -ending.length);
    let lead = "";
    const direction = LEADING_READINGS.find(([word]) => head.startsWith(word) && KANA.test(head.slice(word.length)));
    if (direction) {
      lead = direction[1];
      head = head.slice(direction[0].length);
    }
    if (head.length > 0 && KANA.test(head)) return { reading: lead + toHiragana(head) + said, from: "rule" };
  }
  return null;
}

/** Natural Earth's English names are sometimes in capitals (KYÜSHÜ, SAHARA): written as a name is written. */
export const titleCase = (name) =>
  name === name.toUpperCase()
    ? name.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase())
    : name;

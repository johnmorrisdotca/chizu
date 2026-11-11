/** Text that goes into SVG markup, written once for every drawing: escaped, and numbers to two places. */

/** `text` with `&`, `<`, `>` and `"` escaped, so it can sit in an element or an attribute. */
export const escapeXml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** A coordinate or size as it is written in a drawing: rounded to two places. */
export const num = (value: number): string => String(Math.round(value * 100) / 100);

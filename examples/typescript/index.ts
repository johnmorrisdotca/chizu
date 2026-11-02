import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu, type ChizuDrawOptions } from "@johnmorrisdotca/chizu/draw";

const options: ChizuDrawOptions = { language: "ja", style: true, colors: { JP: "#2f6b4f" } };
const svg: string = drawChizu(WORLD, options);
console.log(svg.startsWith("<svg"), WORLD.regions.length);

// @ts-expect-error "neon" is not a language
const language: ChizuDrawOptions["language"] = "neon";
console.log(language);

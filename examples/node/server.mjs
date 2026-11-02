import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

// A server draws the same SVG a browser does: pure, no DOM, no browser globals.
const svg = drawChizu(WORLD, { language: "ja", style: true, colors: { JP: "#2f6b4f" } });
const page = `<!doctype html><title>The world</title>${svg}`;
console.log(page.length > 1000, WORLD.regions.length);

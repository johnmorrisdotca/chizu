/** Register the map, locator and quiz elements. Import for its browser-only effect; safe on a server. */
import { defineMap, defineLocator, defineQuiz } from "./element.ts";
defineMap();
defineLocator();
defineQuiz();

export * from "./element.ts";

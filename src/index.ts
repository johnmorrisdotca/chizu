/**
 * Chizu 地図: the engine round a map. Framing and zoom, insets, a world that wraps round, the outlines as points,
 * quiz distractors, the callout placer, and pasted place names, over plain `ChizuMap` data. Pure functions: each returns
 * new values and never changes what it was given. No data, no drawing, no page: the maps are
 * `@johnmorrisdotca/chizu/world`, `/countries/<code>` and `/divisions/<code>`; the drawing is `/draw`, the
 * pan-and-zoom map in a page is `/mount`, and the names of every country are `/names`.
 */
export type { Bounds, ChizuCountry, ChizuFeature, ChizuFeatureGroup, ChizuFeatureKind, ChizuFeatureLayer, ChizuGroup, ChizuInset, ChizuMap, ChizuPlace, ChizuProjection, ChizuRegion, MapBox } from "./types.ts";
export {
  MAP_ZOOM_LEVELS,
  boxCentre,
  boxIsWholeMap,
  boxToViewBox,
  focusBox,
  focusRegionFit,
  isMapZoom,
  regionBox,
  regionCentre,
  shapeGlyphBox,
  stepMapZoom,
  wholeMapBox,
  zoomBox,
  zoomToFit,
} from "./frame.ts";
export type { MapZoom } from "./frame.ts";
export { applyInsetTransform, insetFor, insetHoldsWhole, insetsFor, insetTransform, insetTransformAttribute } from "./insets.ts";
export type { InsetTransform } from "./insets.ts";
export { mapWrapsAround, nearestWrappedBox, wrapAcross, wrapIntoBox, wrapOffsets } from "./wrap.ts";
export {
  circleMeetsRing,
  distanceToRing,
  landAnchor,
  mainlandBounds,
  mapOutlines,
  mapRegionPieces,
  parseMapRings,
  pointInRing,
  seaAround,
  segmentMeetsRing,
  shiftedOutlines,
} from "./outlines.ts";
export type { MapOutline, MapPiece, MapRing } from "./outlines.ts";
export { HANDLE_CLEARANCE, HANDLE_RADIUS_RATIO, HANDLE_SLOTS, handleRadius, orderByPosition, placeHandles } from "./handles.ts";
export type { HandleBounds, HandleSpot } from "./handles.ts";
export { HANDLE_LAYOUTS, placeCallouts } from "./callouts.ts";
export type { HandleLayout } from "./callouts.ts";
export { CALLOUT_INSET, CALLOUT_ROOMY, calloutGrid, calloutSpaces, segmentCrossesBox, segmentsCross, segmentsGap } from "./calloutSpace.ts";
export type { CalloutKeepOut, CalloutLand, CalloutObstacle, CalloutPlace } from "./calloutSpace.ts";
export { POLISH_CIRCLE_CLEAR_RADII, POLISH_CLOSE_RADII, calloutFaults } from "./calloutPolish.ts";
export { CALLOUT_RADIUS_RATIO, layoutCallouts } from "./layout.ts";
export type { CalloutRequest, CalloutSpot } from "./layout.ts";
export { DISTRACTOR_SCORES, distractorScore, mapDiagonal, pickDistractors } from "./distractors.ts";
export type { DistractorOptions, Scorable } from "./distractors.ts";
export { findQuestion } from "./quiz.ts";
export { groupBox, groupMap, groupTones, regionGroups } from "./groups.ts";
export { CHIZU_FEATURE_GROUPS, CHIZU_FEATURE_KINDS, featureChosen, featureMap, featuresShown, findFeatures } from "./features.ts";
export type { ChizuFeatureChoice } from "./features.ts";
export type { FindQuestion } from "./quiz.ts";
export { placesFromText, splitPastedPlaces } from "./fromText.ts";
export type { MatchOptions, PastedPlaces } from "./fromText.ts";
export { projectPoint, unprojectPoint } from "./project.ts";
export { CHIZU_STRINGS, chizuLanguageOf, chizuSay, featureKindName, nameOf } from "./strings.ts";
export type { ChizuLanguage } from "./strings.ts";
export { seededRandom, shuffled } from "./random.ts";
export type { Random } from "./random.ts";
export { VERSION } from "./version.ts";

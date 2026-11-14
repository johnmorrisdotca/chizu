/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * One dynamic import for each country's regions as longitude and latitude, so that a bundler makes each its own
 * chunk and a page loads only the ones it draws. Separate from loaders.data.ts, which a page that wants only these
 * would otherwise pull the other maps' loaders in with.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */

import type { ChizuGeoCollection } from "../geo-types.ts";

/** The regions of the 32 countries that have them, as longitude and latitude, by lower-case code. */
export const DIVISIONS_GEO_LOADERS: Readonly<Record<string, () => Promise<{ default: ChizuGeoCollection }>>> = {
  "ar": () => import("./divisions-geo/ar.data.ts"),
  "at": () => import("./divisions-geo/at.data.ts"),
  "au": () => import("./divisions-geo/au.data.ts"),
  "be": () => import("./divisions-geo/be.data.ts"),
  "br": () => import("./divisions-geo/br.data.ts"),
  "ca": () => import("./divisions-geo/ca.data.ts"),
  "ch": () => import("./divisions-geo/ch.data.ts"),
  "cl": () => import("./divisions-geo/cl.data.ts"),
  "cn": () => import("./divisions-geo/cn.data.ts"),
  "co": () => import("./divisions-geo/co.data.ts"),
  "de": () => import("./divisions-geo/de.data.ts"),
  "es": () => import("./divisions-geo/es.data.ts"),
  "fr": () => import("./divisions-geo/fr.data.ts"),
  "gb": () => import("./divisions-geo/gb.data.ts"),
  "ie": () => import("./divisions-geo/ie.data.ts"),
  "it": () => import("./divisions-geo/it.data.ts"),
  "jp": () => import("./divisions-geo/jp.data.ts"),
  "kr": () => import("./divisions-geo/kr.data.ts"),
  "mx": () => import("./divisions-geo/mx.data.ts"),
  "my": () => import("./divisions-geo/my.data.ts"),
  "nl": () => import("./divisions-geo/nl.data.ts"),
  "no": () => import("./divisions-geo/no.data.ts"),
  "nz": () => import("./divisions-geo/nz.data.ts"),
  "pe": () => import("./divisions-geo/pe.data.ts"),
  "ph": () => import("./divisions-geo/ph.data.ts"),
  "pl": () => import("./divisions-geo/pl.data.ts"),
  "ru": () => import("./divisions-geo/ru.data.ts"),
  "se": () => import("./divisions-geo/se.data.ts"),
  "th": () => import("./divisions-geo/th.data.ts"),
  "tw": () => import("./divisions-geo/tw.data.ts"),
  "us": () => import("./divisions-geo/us.data.ts"),
  "vn": () => import("./divisions-geo/vn.data.ts"),
};

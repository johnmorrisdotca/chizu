// The types of the parts of data-config.mjs that the tests read: the build script's own tables, held to the data it made.
export declare const KUNI: { package: string; version: string };
export declare const ISO_JOIN: Readonly<Record<string, { iso: string | null; why: string }>>;
export declare const SHORT_ENGLISH_NOT_FOR_MAPS: Readonly<Record<string, string>>;
export declare const DISPLAY_NAMES: Readonly<Record<string, { name?: string; nameShortJa?: string; reading?: string; why: string }>>;
export declare const CONTINENT_OVERRIDES: Readonly<Record<string, { continent: string; why: string }>>;
export declare const KUNI_NAMES_KEPT_FROM_NATURAL_EARTH: Readonly<Record<string, { en?: boolean; ja?: boolean; why: string }>>;
export declare const NAME_FIXES: Readonly<Record<string, { name?: string; nameJa?: string; unnamed?: boolean }>>;

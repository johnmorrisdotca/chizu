---
title: Upgrading and replacing an older map integration
section: upgrading
order: 11
description: Retain native geometry, resource versions and existing import/anchor contracts.
---

## Updating within 1.x

This documentation rollout preserves the 1.4.0 SDK behavior and data. Explicit country/division/feature export entries name existing wildcard paths. The map ids, region codes, source geometry, projection, native display defaults and seed behavior do not change. Existing `api.html` export anchors remain; new reference pages add the parameter, return and checked-example detail.

Keep version-pinned URLs when a saved lesson or map must retain its exact shapes and answer order. Read the [changelog](../../CHANGELOG.md) before changing data or SDK versions, and retest a representative inset, wrapped world, feature layer and quiz.

## Moving an existing SVG integration

Start with a fixed map import and `drawChizu`. Keep your host’s numeric data and code joins explicit. Add `mountChizu` if pan/zoom and keyboard selection are needed. Replace a geographic coordinate overlay through `projectPoint`; map-unit points or a different projection need their own conversion. Chizu’s generated paths are plain SVG and are not longitude/latitude GeoJSON.

## Moving a native embed

Keep the embed’s maker, region, seed and version. The reviewed builder colour/capital additions remain available. The [embed guide](../embeds.md) covers reflected attributes, callbacks and frame messages. Review new language text separately from a resource or geometry update.

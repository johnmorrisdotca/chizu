---
title: Plain HTML and CDNs
section: how-to
order: 13
description: Put a map on a plain page with one script tag from jsDelivr or unpkg.
---

A page needs no build step. The `element/define` entry registers the `<chizu-map>`, `<chizu-locator>` and `<chizu-quiz>` tags; a script tag from a CDN loads it, and the tag draws itself. The map data is part of the package, so nothing else is fetched.

## jsDelivr

jsDelivr turns a package into a browser module when you add `/+esm`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/chizu/element/define/+esm"></script>
  </head>
  <body>
    <chizu-map region="world" highlight="JP CA" labels></chizu-map>
  </body>
</html>
```

## unpkg

unpkg serves the package's own files; `?module` makes it rewrite the imports inside them.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/chizu/dist/element-define.js?module"></script>
  </head>
  <body>
    <chizu-map region="world" highlight="JP CA" labels></chizu-map>
  </body>
</html>
```

## Notes

- Use `<script type="module">`. A classic script cannot `import`.
- Pin a major version in the address (`@johnmorrisdotca/chizu@1`) when you want the page to stay as it is.
- The attributes are in [embed maps, locators and quizzes](embed-maps.md). If nothing appears, see [troubleshooting](troubleshooting.md).

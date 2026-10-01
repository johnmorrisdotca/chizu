# Contributing

Ideas, bug reports and pull requests are welcome in the
[issues](https://github.com/johnmorrisdotca/chizu/issues).

## Working on it

```sh
pnpm install
pnpm check          # lint, types and tests
pnpm data           # make src/data again from Natural Earth (downloads once into .cache/)
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm test:demo      # build the demo and play it in a real browser
pnpm docs:make      # rewrite docs/strings-ja.md after changing a word of the board
```

`src/data/` is written by `scripts/build-data.mjs` and never by hand. A change to a map is a change to that script
or to `scripts/data-config.mjs`, then `pnpm data`, and the diff of `src/data/` is the review. The script
checks each Natural Earth file against a SHA-256, so the same source makes the same bytes.

A change to a map's codes or to how a region is drawn is a new major version, never a fix: a site keeps what people chose
by region code, and a quiz kept by its seed is made again from it.

## House rules, shared by every package of the family

- Open an issue first for anything bigger than a typo, so that we can agree on the shape before you spend time on it.
- No runtime dependencies. Every function that frames, numbers or draws a map is pure: it returns new values and never changes what it was given.
- Tests sit beside the code they test. A rule you change has a test that would have caught it.
- Words a person reads come in English and Japanese. If you cannot write the Japanese, say so in the pull request and someone will.
- Option values and names are kebab case.
- Data is public domain or CC0, or under a licence checked at its source and credited in `NOTICE.md` and the README. No GPL or LGPL code.
- Needs Node 22 or later. A change a user would notice gets a line in `CHANGELOG.md`.
- **The list of the family in the README is made, not written.** `pnpm family:readme` writes it between its
  markers from `scripts/family-template.mjs` (the names, the Japanese names and a line on each), and
  `scripts/family-readme.mjs` is the same file in every package. To add a package or change a line, change the
  template in every repository, bump `FAMILY_TEMPLATE_VERSION` and record the new hash in `src/family.test.js`.

## Releasing

A version tag (`v1.2.3`, the same as `package.json`'s version) runs
`.github/workflows/release.yml`: it checks and builds the package, attaches the
tarball to a GitHub release, and publishes it to npm by trusted publishing,
with no token. Write the release in `CHANGELOG.md` first.

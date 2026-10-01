**What this changes**

**How it was checked**

- [ ] `pnpm check` passes (lint, types, tests)
- [ ] `pnpm test:demo` passes, if the demo or the mounted map changed
- [ ] `pnpm test:package` passes, if what is published changed
- [ ] `pnpm data` leaves `src/data/` as it was, or the change is a change to the maps and says so (a change to a code or a region is a new major version)
- [ ] A line in `CHANGELOG.md`, if a user would notice

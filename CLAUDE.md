# The Series: working rules

## How to build

- Build cleanly and modularly, with proper architecture and separation of concerns.
- Never bolt a feature on just because it was asked for. Fit it into the structure where it belongs.
- If a feature can't be built naturally in the current structure and a refactor would be the right way to do it, **stop before writing code** and say so: what the refactor is, why, and what it costs. Wait for a decision.

## Shipping

- Bump `APP_VER` in `index.html` and `CACHE` in `sw.js` together on every release.
- Test in a phone-sized browser before pushing: a full session of each affected type, no console errors.
- Commit and push to `main`; the hosted app updates from the repo, and the user taps Force update.
- Never change how saved data (localStorage `the-series-v1`) is shaped without a migration that keeps existing history.

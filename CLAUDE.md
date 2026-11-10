# The Series: working rules

## How to build

- Build cleanly and modularly, with proper architecture and separation of concerns.
- Never bolt a feature on just because it was asked for. Fit it into the structure where it belongs.
- If a feature can't be built naturally in the current structure and a refactor would be the right way to do it, **stop before writing code** and say so: what the refactor is, why, and what it costs. Wait for a decision.

## How it's put together

Plain files, no build step: `index.html` loads `js/main.js` as an ES module, and the browser loads the rest.
Each folder is a layer. A file imports from its own folder or from a layer below, never above
(`tools/check.mjs` enforces this). Lower layers tell upper ones what happened through `js/util/bus.js`.

| Layer | What lives there |
|---|---|
| `js/util/` | Dates, formatting, DOM helpers, the event bus, which screen is showing. |
| `js/data/` | Fixed content: poses, phases and gates, cardio machines and the stair route, exercise stages and facts, looks. |
| `js/engine/` | Builds a session from options. Pure: no saved state, no screen. `build.js` is the entry; `sessions.js` has one function per session type; `exercises.js` is the exercise library; `plan-edit.js` changes a running session (swap, drop, reorder). |
| `js/store.js` | Saved state (`st`), load/save, migrations, the in-progress session. |
| `js/progress/` | Rules that read history to decide what's next: today's options, weights and estimates, set advice, stages, hold targets, recovery, Peloton class, end-of-session review. |
| `js/log/` | Session entries and the set/cardio rows that get exported. |
| `js/export/` | CSV, zip, the export tables, backup. |
| `js/player/` | The running session: the clock and step-to-step flow (`session.js`), figure, sound, what the step shows (`view.js`), the sheets, the buttons. |
| `js/ui/` | The home screen, one file per section, and the done screen. `home.js` redraws all of it on `state:changed`. |
| `css/` | `tokens`, `controls`, then one file per screen, then one file per look (`layout-*`, `skin-*`, `type-*`). Link order in `index.html` matters: looks come last. |

Where things go:
- A new exercise: `engine/exercises.js`, then the slot that uses it in `engine/strength.js`. Stages or facts for it: `data/guide.js`. Its weight ratio: `progress/weights.js`.
- A new session type: a function in `engine/sessions.js`, registered in `engine/build.js`, listed in `data/catalog.js`.
- A new rule about what to do next: `js/progress/`. It reads `st`; the engine gets the result as an option.
- A new home section: markup in `index.html`, a file in `js/ui/` with `render…` and `init…`, called from `ui/home.js` and `main.js`.
- A new look: an entry in `data/looks.js` and a stylesheet in `css/` linked from `index.html`.

## Shipping

- Bump `APP_VER` in `js/version.js` and `CACHE` in `sw.js` together on every release.
- Every file the app loads must be in `ASSETS` in `sw.js`. The service worker caches each version whole, so a missing file means that file never loads.
- Run `node tools/check.mjs` before pushing. It checks the two rules above, the layer rule, and that the engine still builds the same sessions. If you changed sessions on purpose, run it with `--accept` and commit the new `tools/engine.hash`.
- Test in a phone-sized browser before pushing: a full session of each affected type, no console errors.
- Commit and push to `main`; the hosted app updates from the repo, and the user taps Force update.
- Never change how saved data (localStorage `the-series-v1`) is shaped without a migration in `js/store.js` that keeps existing history.

# Hunter System — Extension Implementation Plan

Companion to `hunter_extension_prd.md`. Tells a builder (human or agentic, e.g. Antigravity) *how* to build the Chrome extension, in what order, with what stack, against the already-deployed backend at `https://cf-hunter-system.onrender.com`.

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Extension platform | Chrome Extension, **Manifest V3** | Current required standard for Chrome Web Store |
| Language | **Plain JavaScript** (no TypeScript, no build-required framework) — matches the backend's stack decision | Fast iteration, no compile step, consistent with the rest of the project |
| Content script framework | Vanilla JS + Shadow DOM for the HUD | Avoids CSS collisions with Codeforces' own styles; no React/Vue runtime needed for this scope |
| Background | Manifest V3 service worker (`background.service_worker`) | Owns all network calls (fetch + SSE handling), message-passes to content scripts |
| Styling | Plain CSS injected into the Shadow DOM root | Keeps the HUD visually isolated from Codeforces' stylesheet |
| Storage | `chrome.storage.local` (cached profiles, TTL) + `chrome.storage.session` (HUD position/collapsed state per browser session) | Matches Manifest V3 storage APIs; no external DB needed client-side |
| Networking | `fetch` for REST calls; streaming `fetch` + manual SSE line-parsing for realtime (see §3 Open Item resolution below) | `EventSource` is unreliable inside a service worker once it goes idle |
| Build tooling | None required — plain JS files loaded directly via manifest | No bundler needed for this scope; if the team wants module bundling later, esbuild is the lightest option, but it's optional |
| Testing | Jest for pure logic (threat classification, gate classification, comparison math); manual/Playwright for DOM injection smoke tests | Keep runtime-calculation logic pure and unit-testable, same philosophy as the backend engine |

**Backend base URL is fixed and already deployed:** `https://cf-hunter-system.onrender.com`. Do not stand up a second backend or mock server for this build — integrate directly against the real, live API (its Swagger docs are at `https://cf-hunter-system.onrender.com/docs`).

---

## 2. Resolving PRD Open Item #2 (SSE inside a Manifest V3 service worker)

**Decision:** Open the SSE connection from the **content script's page context**, not the background service worker.

Rationale: Manifest V3 service workers are not guaranteed to stay alive for the duration of a long-lived `EventSource`/streaming connection — they can be killed and restarted by Chrome at any time, which would silently drop the connection. Content scripts run in a normal page-like JS context tied to the tab's lifetime, which is a much better fit for a long-lived SSE stream. The content script owns the `EventSource` to `GET /hunter/{handle}/events`, and relays parsed stage events to the HUD UI (which the content script also owns) — no cross-context message-passing is even needed for this specific piece. The service worker is still used for one-shot REST calls (`GET /hunter/:handle`, `POST /refresh`, etc.) that don't need a long-lived connection, keeping a clean separation: **service worker = short REST calls, content script = SSE + rendering.**

---

## 3. Repository Structure

```
hunter-system-extension/
├── manifest.json
├── src/
│   ├── background/
│   │   └── service_worker.js         # REST calls, message router for content scripts
│   ├── content/
│   │   ├── contentScript.js          # entrypoint injected into codeforces.com pages
│   │   ├── pageDetector.js           # detects page type: profile / problem / contest / standings
│   │   ├── scrapers/
│   │   │   ├── profileScraper.js     # extracts handle + rating from a profile page
│   │   │   ├── problemScraper.js     # extracts problem rating/tags from a problem page
│   │   │   └── contestScraper.js     # extracts contest type/status/start time
│   │   ├── hud/
│   │   │   ├── hudRoot.js            # Shadow DOM mount point, drag/collapse behavior
│   │   │   ├── hudModes/
│   │   │   │   ├── threatAnalysis.js
│   │   │   │   ├── hunterAnalysis.js
│   │   │   │   ├── gateAnalysis.js
│   │   │   │   ├── hunterStatus.js
│   │   │   │   └── questMode.js
│   │   │   ├── systemWindows.js      # temporary auto-dismiss overlays
│   │   │   └── hud.css
│   │   ├── sse/
│   │   │   └── registrationStream.js # owns EventSource to /hunter/:handle/events
│   │   └── runtime/
│   │       ├── monsterAnalysis.js    # pure fn: (problemRating, hunterProfile) => ThreatResult
│   │       ├── gateAnalysis.js       # pure fn: (contestInfo, hunterProfile) => GateResult
│   │       ├── threatClassification.js
│   │       ├── hunterComparison.js   # pure fn: (profileA, profileB) => ComparisonResult
│   │       └── gateClassification.js # contest type => Gate name, full mapping table
│   ├── api/
│   │   └── hunterApiClient.js        # thin wrapper: getHunter, getStatus, refreshHunter, compareHunters, healthz
│   ├── storage/
│   │   ├── profileCache.js           # chrome.storage.local wrapper with TTL logic
│   │   └── hudState.js               # chrome.storage.session wrapper for HUD position/mode
│   └── shared/
│       └── constants.js              # BASE_URL, TTLs, threat thresholds, gate mapping table
├── icons/
├── tests/
│   └── runtime/                      # unit tests for pure functions above
├── .env.example                      # not used at runtime (no build step), documents BASE_URL for reference only
└── README.md
```

The **`runtime/`** directory (client-side equivalent of the backend's `engine/`) must contain only pure functions — no DOM access, no `chrome.*` API calls, no network calls. This is what makes Monster Analysis, Gate Analysis, Threat Classification, and Hunter Comparison unit-testable in isolation, mirroring the backend's engine/API separation.

---

## 4. Build Phases

### Phase 0 — Scaffolding
- `manifest.json` (Manifest V3): declare `background.service_worker`, `content_scripts` matching `https://codeforces.com/*`, `host_permissions` for `https://codeforces.com/*` and `https://cf-hunter-system.onrender.com/*`, `storage` permission.
- Basic folder structure above, empty stub files.
- Load unpacked in Chrome, confirm the content script logs a message on any `codeforces.com` page and the service worker installs without errors.
- **Definition of done:** extension loads with no manifest errors; content script confirmed running via console log on a real Codeforces page.

### Phase 1 — API Client Layer (service worker)
- `hunterApiClient.js`: wraps all REST calls to `https://cf-hunter-system.onrender.com` — `getHunter(handle)`, `getStatus(handle)`, `refreshHunter(handle)`, `compareHunters(handleA, handleB)`, `healthz()`.
- Handle all documented response shapes: `200` profile, `202` processing, `404` not found, `429` rate-limited, network/timeout errors — map each to a typed result object (e.g. `{ ok: true, data }` / `{ ok: false, reason: 'PROCESSING' | 'NOT_FOUND' | 'RATE_LIMITED' | 'UNREACHABLE', jobId? }`).
- Add a distinct "cold start" detection: if a request takes longer than ~4s but eventually succeeds, tag the result so the UI can show "waking up the SYSTEM..." instead of implying something was wrong.
- Service worker message router: listens for messages from content scripts (`{ type: 'GET_HUNTER', handle }`, etc.), calls the API client, responds.
- **Definition of done:** from the extension's service worker console, manually calling each API client function against the real deployed backend returns correctly shaped results for a known-good handle, a fresh/unknown handle, and a deliberately invalid handle.

### Phase 2 — Page Detection & Scrapers
- `pageDetector.js`: given `location.pathname`, classify the current page as `PROFILE | PROBLEM | CONTEST | STANDINGS | OTHER`.
- `profileScraper.js` / `problemScraper.js` / `contestScraper.js`: extract only what's needed for runtime calculations (handle, current rating if visible, problem rating/tags, contest type/status/start time) directly from the DOM. Keep selectors centralized and commented, since Codeforces markup can change.
- **Definition of done:** on real Codeforces pages of each type, logging the scraper output in the console shows correct, accurate extracted values.

### Phase 3 — Runtime Calculation Modules (pure functions, unit-tested)
Implement each as an isolated pure function with unit tests using fixture data (no live page, no live API):

1. `threatClassification.js` — `(problemRating, hunterRating) => { level, color }`. Resolve PRD Open Item #4 by defining concrete rating-difference thresholds for the six tiers (Very Easy → Catastrophic) as constants in `shared/constants.js`, not hardcoded inline.
2. `monsterAnalysis.js` — combines threat classification + recommended rank/difficulty into a single display-ready object.
3. `gateClassification.js` — full contest-type → Gate-name mapping table, resolving PRD Open Item #1 (cover Div 1/2/3, ICPC-style, Kotlin Heroes, etc., not just the 4 examples in the PRD).
4. `gateAnalysis.js` — combines gate classification + contest status/timing into a display-ready object.
5. `hunterComparison.js` — given two raw Hunter Profiles (from `/compare`), computes Mana/Level/Combat-Proficiency differences and a relative threat label.
- **Definition of done:** all five modules have unit tests covering typical + edge cases (e.g. problem rating far below/above Hunter rating, unknown contest type, identical profiles being compared) and have zero imports from `chrome.*`, DOM, or network code.

### Phase 4 — HUD Shell
- `hudRoot.js`: creates a single Shadow DOM host element appended to `document.body`, mounts `hud.css` inside the shadow root, implements drag-to-reposition and collapse/expand.
- Persist position/collapsed state via `hudState.js` (`chrome.storage.session`), restored on each page load within the same browser session.
- Ensure only one HUD instance exists per tab (guard against duplicate injection on SPA-style navigation within Codeforces, if applicable).
- **Definition of done:** HUD appears once per tab, is draggable, collapsible, and doesn't visually clash with or break any Codeforces page styling.

### Phase 5 — Hunter Profile Fetch + Caching Integration
- Wire `contentScript.js` to: detect handle(s) on the current page → check `profileCache.js` (TTL-based `chrome.storage.local` cache) → if stale/missing, message the service worker's API client → render result into the HUD.
- Implement all UX states from PRD §8 (Unknown Hunter / Processing / Ready / Outdated / Not Found / Backend Unreachable), including the distinct cold-start "waking up" state from Phase 1.
- **Definition of done:** visiting a real Codeforces profile page for a handle never analyzed before shows the "Unknown Hunter Detected" prompt; a handle already registered on the backend shows a populated HUD within a reasonable time.

### Phase 6 — Registration Flow (SSE, content-script-owned)
- `registrationStream.js`: opens `EventSource` directly from the content script to `GET https://cf-hunter-system.onrender.com/hunter/{handle}/events` (per the Section 2 decision above).
- Drive the SYSTEM registration narrative (PRD §7.3) strictly off received SSE events, one line active at a time — no fake timers.
- On SSE error/drop, fall back to polling `GET /hunter/{handle}/status` via the service worker every 3–5s until `READY`/`FAILED`.
- Close the SSE connection on `READY`/`FAILED` or when the tab/page unloads.
- **Definition of done:** registering a real, never-before-seen handle shows the full narrative in order, ending with a fully rendered HUD, with no fabricated delays — the pacing should reflect real backend timing.

### Phase 7 — SYSTEM Windows & Milestone Detection
- `systemWindows.js`: renders short-lived, auto-dismissing overlays above the HUD.
- Implement a simple diff check between the newly fetched profile and the last cached one (from `profileCache.js`) to detect "Hunter Promotion" style milestones (resolve PRD Open Item #3 with a concrete, documented rule, e.g. "Hunter Level crossed a multiple-of-5 boundary" or similar — pick something explicit and testable, don't leave it vague).
- **Definition of done:** artificially seeding two different cached profile states (before/after) in a test triggers the expected SYSTEM Window exactly once, and it auto-dismisses.

### Phase 8 — Universal Scan & Relative Comparison
- Add the Universal Scan entrypoint (context menu via `chrome.contextMenus` and/or an in-HUD button) that routes to the correct lightweight (client-only) or deep (backend-triggering) scan based on what's currently in view.
- Wire up `hunterComparison.js` to the `/compare` endpoint when two Hunters are simultaneously in view (e.g. comparing yourself to a contest's top performer).
- **Definition of done:** scanning a Monster/Gate/Tag on-page is instant with no network call; scanning an unregistered Hunter correctly falls into the registration flow from Phase 6.

### Phase 9 — Polish, Resilience, Packaging
- Add the distinct cold-start UI state everywhere requests happen (not just Phase 5), verified against the real Render-hosted backend after a period of inactivity.
- Add a startup `GET /healthz` check to show a small "SYSTEM online/offline" indicator in the HUD.
- Verify graceful behavior with `chrome://extensions` reload, tab duplication, and multiple simultaneous tabs on different Codeforces pages.
- Prepare Chrome Web Store packaging: icons, screenshots, store listing copy, privacy policy stub (extension only sends public handles to the backend — document this plainly).
- **Definition of done:** extension works reliably across profile/problem/contest/standings pages, survives a cold backend gracefully, and is packaged as a loadable `.zip` for Web Store submission.

---

## 5. Suggested Build Order Summary

```
Phase 0  Scaffolding (manifest, folder structure)
Phase 1  API client layer (service worker, real backend calls)
Phase 2  Page detection & scrapers
Phase 3  Runtime calculation modules (pure, unit-tested)
Phase 4  HUD shell (Shadow DOM, drag/collapse)
Phase 5  Profile fetch + caching integration + UX states
Phase 6  Registration flow (SSE, content-script-owned)
Phase 7  SYSTEM Windows & milestone detection
Phase 8  Universal Scan & relative comparison
Phase 9  Polish, resilience, packaging
```

This mirrors the backend's phase philosophy: get the pure computation core (Phase 3) isolated and tested early, wire up the "dumb plumbing" (API calls, scraping, storage) around it, and only then layer on presentation and polish.

---

## 6. Things an Implementer Must NOT Do (guardrails from the PRD)

- Do not recompute any backend-owned metric (Hunter Rank, Level, Mana, Combat Proficiency, Skill Affinities, Achievements) client-side — always render the value verbatim from the API response.
- Do not call any backend endpoint not documented in the deployed Swagger docs (`https://cf-hunter-system.onrender.com/docs`) — if something's missing, that's a backend change request, not a client workaround.
- Do not auto-register handles in bulk (e.g. scraping an entire contest standings page and silently firing dozens of registration requests) — registration is always an explicit, single, user-confirmed action per handle.
- Do not modify visible Codeforces page content/text/forms — the HUD is strictly an overlay.
- Do not use `EventSource` from the background service worker — see Section 2's resolved decision.
- Do not introduce a build/bundle step unless the team explicitly asks for one later — ship plain JS files directly.

---

## 7. Handoff Checklist

- [ ] Read `hunter_extension_prd.md` fully, including the Open Items section, before writing code.
- [ ] Confirm the Section 2 SSE-ownership decision (content script, not service worker) before starting Phase 6.
- [ ] Resolve/confirm PRD Open Items #1 (full Gate mapping), #3 (milestone diff rule), and #4 (threat thresholds) with concrete values before finalizing Phase 3.
- [ ] Verify the real deployed backend's actual response shapes against its live Swagger docs before writing `hunterApiClient.js` — do not assume the PRD's documented shapes are 100% unchanged from what was actually shipped.
- [ ] Build and fully unit-test `runtime/` before wiring up HUD rendering.
- [ ] Test end-to-end against the real backend at `https://cf-hunter-system.onrender.com`, including at least one cold-start scenario, before considering any phase complete.
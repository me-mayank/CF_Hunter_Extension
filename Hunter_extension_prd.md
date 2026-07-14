# Hunter System — Extension PRD

Version: 1.0
Status: Draft, ready for build
Scope: **Chrome Extension (frontend/runtime) ONLY.** The backend (Hunter Engine) is already built and deployed. This document defines the client that consumes it.

Deployed backend base URL: `https://cf-hunter-system.onrender.com`

---

## 1. Purpose of This Document

The Hunter Engine backend is live at the URL above. This PRD defines the **Chrome Extension** that turns Codeforces into the Hunter System's holographic overlay, consuming that backend's REST + SSE API. It is derived from the extension-facing sections of the three original source docs (`product_prd.md`, `backend_engine_prd.md`, `storage.md`) plus the backend's actual, deployed API surface.

The backend is the single source of truth for anything expensive or historical (Hunter Rank, Level, Mana, Combat Proficiency, Skill Affinities, etc.). The extension must not recompute, cache-and-drift, or override any of those values — it only renders them and computes lightweight, page-local values.

---

## 2. Product Framing (recap)

> The webpage is reality. The SYSTEM is another layer of reality projected on top of it.

- Extension never redesigns Codeforces — it overlays a holographic HUD.
- Every Codeforces user → **Hunter**. Every problem → **Monster**. Every contest → **Gate**. Every submission → **Battle**.
- Design philosophy: **Extension → Display. Backend → Think. Database → Remember.**

Gate classification mapping (from source docs, used for display labels only):

| Codeforces Contest Type | Gate Classification |
|---|---|
| Div 4 | E-Rank Gate |
| Educational | Training Gate |
| Gym | Simulation Gate |
| Global Round | National Gate |

(Other contest types not explicitly listed need a mapping decision — see §11 Open Items.)

---

## 3. Goals

1. Render a persistent, non-intrusive holographic HUD on top of Codeforces pages.
2. Fetch and display Hunter Profiles from the deployed backend — never recompute backend-owned metrics client-side.
3. Perform only page-local, instantaneous calculations client-side (Monster threat, Gate classification, live comparisons) as defined in the Responsibility Matrix (§6).
4. Turn "Hunter registration" into an in-character SYSTEM experience (via the backend's SSE stage events), not a generic loading spinner.
5. Work entirely from public, unauthenticated data — no login, no write access to Codeforces itself.
6. Degrade gracefully when the backend is slow/cold (Render free-tier cold starts) or unavailable.

## 4. Non-Goals

- No backend logic duplicated client-side. If a value is in the Hunter Profile, the extension displays it — it does not derive its own version.
- No modification of Codeforces DOM content itself (text, forms, submission actions) — only an overlay.
- No new backend endpoints invented by the extension team; if something's missing, it's a backend PRD change, not a client-side workaround.
- No account linking / OAuth — Hunter identity is just the Codeforces handle visible on the page.

---

## 5. Architecture

```
Codeforces Page (DOM)
        │
        ▼
Content Script(s)          — reads current page context (problem/contest/profile), injects HUD
        │
        ▼
Background Service Worker  — owns all network calls to the backend (fetch + SSE), message-passes to content scripts
        │
        ▼
https://cf-hunter-system.onrender.com   (REST + SSE — already deployed, treated as a black box)
        │
        ▼
chrome.storage.local        — short-lived client cache of Hunter Profiles (not a source of truth, just to avoid refetching on every navigation)
```

Why the background service worker owns network calls (Manifest V3 detail): content scripts run in the context of `codeforces.com` and are subject to that page's CSP; routing all backend calls through the service worker avoids CSP/cross-origin friction and centralizes API logic in one place.

---

## 6. Responsibility Matrix (backend vs. extension — from product_prd.md, reconfirmed)

| Feature | Backend (already built) | Extension (this build) |
|---|---|---|
| Hunter Rank / Level / Mana / Combat Proficiency / Skill Affinities / Active Days / Contest Experience / Monster Distribution / Combat Record / Achievements / Hunter Statistics | ✅ | ❌ (display only) |
| Hunter Comparison (diff math) | ❌ | ✅ |
| Monster Analysis / Threat Level / Threat Color | ❌ | ✅ |
| Gate Analysis / Gate Classification / Gate Status | ❌ | ✅ |
| Recommended Hunter Rank / Estimated Difficulty | ❌ | ✅ |
| HUD Rendering / Scan Animation / SYSTEM Windows / Notifications | ❌ | ✅ |

The extension's only "intelligence" is: **current page + Hunter Profile (already computed) → instantaneous, disposable, page-scoped presentation logic.** Nothing computed here is persisted anywhere.

---

## 7. Functional Requirements

### 7.1 Hunter Profile Retrieval

- On first detecting a Codeforces handle on a page (own profile, someone else's profile, a submission author, etc.), the extension calls:
  - `GET https://cf-hunter-system.onrender.com/hunter/{handle}`
- Possible responses (per the deployed API):
  - `200` → Hunter Profile ready. Cache in `chrome.storage.local` with a short TTL (e.g. 15 min) keyed by handle, and render the HUD.
  - `202 { status: "PROCESSING", jobId }` → Show the "Unknown Hunter Detected — Register this Hunter? [ Analyze ]" SYSTEM prompt (§7.3) if this is a first-time registration, or a lightweight "still analyzing" indicator if a job is already in flight.
  - `404` → Handle isn't a real Codeforces user; show a neutral "not found" state, don't retry automatically.
  - `429` / network error / cold-start timeout → Show a "SYSTEM temporarily unreachable" state with a manual retry action; never spin forever (see §9 Non-Functional Requirements on Render cold starts).

### 7.2 Registration Trigger

- Only triggered by explicit user action (clicking "Analyze"), never automatically in bulk — the extension must not silently mass-request unknown handles (e.g. don't auto-register every name on a contest standings page).
- On confirmation, the extension does not call a separate "register" endpoint — registration is implicit: re-calling `GET /hunter/{handle}` after the user confirms is sufficient, since the backend already returns `PROCESSING` + creates the job on first request. The extension should not spam repeated `GET` calls; it opens the SSE stream instead (§7.4).

### 7.3 Registration Experience (SYSTEM narrative, tied to real SSE events)

Instead of a spinner, render the following as a sequential SYSTEM narrative, one line active at a time, driven by real SSE stage events from `GET /hunter/{handle}/events`:

```
Synchronizing with Hunter Association...
Collecting Battle Records...
Analyzing Combat History...
Computing Weightage...
Computing Hunter Level...
Computing Mana...
Building Skill Profile...
Registering Hunter...
Hunter Successfully Registered.
```

Each line must only advance when the corresponding backend SSE event actually arrives — never fake/timer-based progress. If the SSE connection drops, fall back to polling `GET /hunter/{handle}/status` at a reasonable interval (e.g. every 3–5s) until `READY`/`FAILED`.

### 7.4 Realtime Progress (SSE)

- Open `EventSource` (or a `fetch` + `ReadableStream` reader, since `EventSource` can't be proxied as easily through a service worker in MV3 — see §11 Open Items) against `GET /hunter/{handle}/events` while a job is `PROCESSING`.
- Close the connection on receiving `READY`, `FAILED`, or losing visibility of the tab (reopen if the user returns and the job is still in flight).
- On `READY`, the final SSE payload contains the complete profile — use it directly rather than issuing an extra `GET /hunter/{handle}` call.

### 7.5 Persistent SYSTEM HUD

- A single, persistent, draggable, collapsible, floating HUD panel injected into every Codeforces page (via a Shadow DOM root to avoid CSS collisions with the host page).
- Modes: **Threat Analysis, Hunter Analysis, Gate Analysis, Hunter Status, Quest Mode.** Mode is selected based on page type (see §7.7) but user can manually switch.
- Persists position/collapsed-state across page navigations within the same tab session (in-memory or `chrome.storage.session`), not across browser restarts unless explicitly desired.
- Only one HUD instance exists per tab at a time.

### 7.6 SYSTEM Windows (temporary overlays)

Short-lived, auto-dismissing overlays layered above the HUD for moment-to-moment events, e.g.:

- Monster Defeated (detected via page state, e.g. an "Accepted" verdict appearing on a submission page the user is viewing)
- Hunter Promotion (rank/level milestone crossed, detected by diffing the newly fetched profile against the last cached one)
- Achievement Unlocked

These never replace the HUD and never block interaction with the underlying Codeforces page.

### 7.7 Page Detection & Live Runtime Calculations

The extension must detect which Codeforces page it's on and compute the following **entirely client-side**, using only the current page's DOM + the already-fetched Hunter Profile (no backend calls beyond the initial profile fetch):

**Monster Analysis** (on a problem page):
```
Problem Rating (scraped from page) − Hunter Rating (from profile) = Threat Difference
→ map to Monster Threat Level (Very Easy / Easy / Equal / Dangerous / Extreme / Catastrophic)
→ map to a display color
→ display Recommended Hunter Rank / Estimated Difficulty
```

**Gate Analysis** (on a contest page):
```
Contest Type (scraped/inferred) → Gate Classification (table in §2)
Contest Status (upcoming/running/finished, scraped) → Gate Status
Time until start (scraped) → "Time Until Gate Opens"
→ Recommended Hunter Rank for this Gate
```

**Relative Hunter Comparison** (when two Hunter Profiles are available, e.g. via the backend's `GET /hunter/{handleA}/compare/{handleB}` endpoint returning both raw profiles):
```
Mana Difference, Hunter Level Difference, Combat Proficiency Difference, Relative Threat
```
All diffing math happens client-side; the backend only supplies the two raw profiles side-by-side.

**Threat Classification** — shared helper used by Monster Analysis; a pure function of `(problemRating, hunterRating)`.

**HUD Rendering** — layout, animations, scan effects, panel transitions, glitch effects: presentation-only, no backend involvement.

### 7.8 Universal Scan

A "scan" affordance (e.g. right-click context menu entry or an in-HUD button) that lets the user request an analysis of whatever entity they're currently looking at: a Hunter, a Monster (problem), a Gate (contest), a Rank, an Achievement, or a Tag.

- Lightweight scans (Monster/Gate/Threat/Tag) use only page data + cached profile — instant, client-side.
- Deep scans (unregistered Hunter, or an outdated profile) trigger the registration/refresh flow against the backend (§7.1–7.4).

---

## 8. UX States Summary

| State | Trigger | Extension behavior |
|---|---|---|
| Unknown Hunter | `202` on first `GET` for a never-seen handle | Show "Unknown Hunter Detected" prompt with `[ Analyze ]` |
| Processing | Job in flight | Show SYSTEM registration narrative via SSE (§7.3) |
| Ready | `200` with profile | Render full HUD content for the active mode |
| Outdated | Cached profile older than TTL, or backend marks `OUTDATED` | Re-fetch in background; show last-known data with a subtle "refreshing" indicator, don't block the UI |
| Not Found | `404` | Neutral empty state, no retry loop |
| Backend Unreachable | Network error / timeout / cold start | "SYSTEM temporarily unreachable" state + manual retry; see §9 |

---

## 9. Non-Functional Requirements

- **Manifest V3** compliant (service worker background, no persistent background page).
- **Performance:** HUD injection and page-local calculations must not visibly delay Codeforces page rendering. Defer HUD mount until after the page's main content is interactive.
- **Render.com cold starts:** the backend is on a free/hobby tier and may cold-start (multi-second delay) after inactivity. The extension must show a distinct "waking up the SYSTEM..." state for slow-but-eventually-successful requests, distinguished from a genuine failure, with a reasonable timeout (e.g. 15–20s) before offering manual retry.
- **Permissions:** `host_permissions` for `https://codeforces.com/*` (content script injection) and `https://cf-hunter-system.onrender.com/*` (API calls from the service worker). No broader host permissions requested.
- **Privacy:** only publicly visible Codeforces handles are ever sent to the backend; no scraping of private account data, no analytics/telemetry beyond what's needed for the product to function.
- **Resilience:** if the backend is down, previously cached profiles (within TTL) should still render so the extension isn't fully broken by a transient outage.

---

## 10. API Surface Consumed (backend already live — for reference)

| Method | Path | Used for |
|---|---|---|
| `GET` | `/hunter/:handle` | Profile fetch / registration trigger |
| `GET` | `/hunter/:handle/status` | Lightweight status poll (SSE fallback) |
| `POST` | `/hunter/:handle/refresh` | Manual "force refresh" action in the HUD (rate-limited backend-side) |
| `GET` | `/hunter/:handle/events` | SSE registration/refresh progress |
| `GET` | `/hunter/:handleA/compare/:handleB` | Relative Hunter Comparison raw data |
| `GET` | `/healthz` | Extension startup check / "SYSTEM online" indicator |

The extension must treat this as a fixed contract — if a response shape doesn't match what's documented in the backend's Swagger docs (`/docs` on the deployed URL), that's a backend-side bug to report, not something to patch around client-side.

---

## 11. Open Items / Decisions Needed During Build

1. **Full Gate Classification mapping** — only 4 contest types are mapped (§2); Div 1/Div 2/Div 3/ICPC-style/Kotlin Heroes etc. need explicit classifications before Gate Analysis can cover all contest types.
2. **SSE via Manifest V3 service worker** — native `EventSource` isn't ideal inside a service worker (no persistent connection guarantees once the worker goes idle). Decide between: (a) opening the SSE connection from the content script's page context instead, or (b) using a `fetch` streaming reader in the service worker with keep-alive alarms. Needs a concrete decision in the implementation plan.
3. **Achievement/Milestone diffing** — "Hunter Promotion" and "Achievement Unlocked" SYSTEM Windows require comparing the new profile to the last cached one; the exact diff rules (what counts as a "promotion") aren't defined in the source docs and need a v1 scope decision.
4. **Threat Level thresholds** — the six-tier scale (Very Easy → Catastrophic) needs concrete rating-difference cutoffs; not specified numerically in any source doc.
5. **Cross-origin cookie/session state** — confirm the backend requires no auth/cookies at all (it appears to be fully public/read-only); if that changes, this PRD's permission model needs revisiting.

---

## 12. Success Criteria

- Visiting any Codeforces profile, problem, or contest page shows the persistent SYSTEM HUD without altering the underlying page content.
- A never-before-seen handle can be registered end-to-end from the extension, with real (not fake) progress narration, ending in a rendered Hunter Profile.
- Problem pages show correct, instant Threat/Monster analysis with no perceptible delay.
- The extension never duplicates a backend-owned computation (Hunter Level, Mana, etc.) — those numbers always come verbatim from the API.
- A cold backend (Render sleep) results in a clear, distinct "waking up" state rather than an ambiguous failure or infinite spinner.
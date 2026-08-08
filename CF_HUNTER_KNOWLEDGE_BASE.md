# CF Hunter - Ultimate Knowledge Base

This document serves as the canonical source of truth for the CF Hunter project. It contains every technical, product, and philosophical detail required for downstream processing, documentation, or content generation.

---

## Project Overview

### What is CF Hunter?
CF Hunter is a Chrome Extension and Backend System that overlays RPG (Role-Playing Game) mechanics—heavily inspired by *Solo Leveling*—onto Codeforces. It transforms the standard competitive programming experience into an immersive, gamified journey without altering or interfering with the underlying Codeforces data.

### Why was it built?
Competitive programming (CP) is notoriously grueling. Burnout, rating anxiety, and repetitive grinding often push talented developers away. CF Hunter was built to reintroduce excitement, dopamine, and a sense of tangible, long-term progression into the CP grind.

### Which problems of Codeforces does it solve?
- **Rating Anxiety:** Standard CF emphasizes rating drops, which discourages practice. CF Hunter emphasizes "Hunter Level" and "Experience," which only goes up as you solve problems.
- **Boring UI:** Codeforces is functional but visually dated. CF Hunter injects a stunning, futuristic glassmorphic UI.
- **Lack of Short-Term Goals:** Knowing what problems to solve is hard. CF Hunter classifies problems as "Monsters" and visually tells you if it's an "Equal Match" or a "Catastrophic Risk."

### Vision behind the project
To make competitive programming as addicting and rewarding as playing a high-quality RPG.

### Inspiration
*Solo Leveling* (Manhwa/Anime). Concepts like "Gates" (Dungeons), "Monsters," "Hunters," "System Awakening," and "Mana" are directly adapted to fit competitive programming paradigms.

### Philosophy
1. **Never alter official data:** CF Rating is the law. We only augment the experience.
2. **Zero Friction:** No logins, no passwords, no heavy setups.
3. **Immersive Aesthetics:** The UI must feel premium, dangerous, and futuristic.

---

## Target Users

- **Newbies & Pupils (Beginners):** Gives them a reason to keep grinding even if their official rating drops. The "Level Up" mechanic provides a secondary progression system.
- **Specialists & Experts (Intermediates):** Helps them analyze their skill affinities (e.g., discovering they are a "Mage" because they excel at DP and Math).
- **Daily Practice Users:** Turns the daily grind into "Daily Quests." Streaks and Active Days directly boost their Mana Power.
- **Virtual Contest Users:** Transforms virtual practice into "Simulation Gates," making past contests feel like active, high-stakes dungeons.

---

## Core Features

### 1. The Hunter Profile (HUD)
- **Description:** A futuristic glassmorphic overlay on the Codeforces profile page.
- **User Workflow:** Visit any profile -> click "Awaken System" (sync) -> view RPG stats.
- **Why it matters:** Replaces the boring CF profile with an RPG character sheet.
- **Screens affected:** `/profile/*`
- **Technical implementation:** Web Components injected via Shadow DOM, pulling computed stats (Mana, Level, Affinities) from the Backend Engine API via local Chrome storage cache.

### 2. Gate Analysis
- **Description:** Classifies Codeforces Contests into Gates (S-Rank, A-Rank, B-Rank, etc.).
- **User Workflow:** Open a contest page. A scanning animation plays, projecting the Threat Level.
- **Why it matters:** Sets the mood before a contest. Tells a user if they are out of their depth or expected to dominate.
- **Screens affected:** `/contest/*`
- **Technical implementation:** Reads the contest title, maps Div 1/2/3 to Tiers, compares Gate Tier to the logged-in Hunter's Tier, and computes Relative Threat (e.g., CATASTROPHIC RISK).

### 3. Monster Analysis
- **Description:** Classifies Codeforces Problems into Monsters (Goblins, Orcs, Dragons).
- **User Workflow:** Open a problem. The extension scans the rating and tags.
- **Why it matters:** Gives personality to math problems.
- **Screens affected:** `/problemset/problem/*`, `/contest/*/problem/*`
- **Technical implementation:** Maps CF rating to Monster Classes. Reads CF tags (e.g., DP, Math) and maps them to required Hunter Stats (Intelligence, Magic).

---

## Complete Feature Walkthrough

1. **Installation:** User installs the Chrome Extension.
2. **Codeforces Load:** User opens `codeforces.com`.
3. **Zero-Friction Auth:** The extension silently scrapes the DOM header to find the logged-in handle.
4. **System Awakening:** A terminal-like boot sequence plays. The extension connects via Server-Sent Events (SSE) to the backend.
5. **Data Collection:** The backend fetches up to 50,000 past submissions, crunches the numbers in a BullMQ background job, and returns the RPG profile.
6. **Profile Page:** The user views their Hunter Level, Mana Power, and Skill Affinities.
7. **Problemset:** Standard CF problems are now colored and tagged with Monster classifications.
8. **Contest Page:** Opening a contest triggers a "Gate Analysis" window, warning the user of the impending threat level.

---

## UI Showcase

- **Panels & HUD:** Uses Glassmorphism (blur, semi-transparent dark backgrounds, cyan/purple glowing borders).
- **Colors:** 
  - Cyan (`#1EDBFF`): System default, Equal Match.
  - Red (`#FF5E5E`): Danger, Catastrophic Risk, Strength.
  - Green (`#4BE38A`): Safe, No Threat, Agility.
  - Purple/Gold: High-tier hunters/monsters.
- **Animations:** Typewriter effects for scanning text, pulse glows on high-threat elements.
- **Isolation:** Everything is wrapped in a Shadow DOM to prevent Codeforces' legacy CSS from ruining the futuristic layout.

---

## Screens

- **Profile Page (`/profile/*`):** Replaced with the Hunter Character Sheet. Shows Radar charts for Skill Affinities, Mana Gauge, and Level.
- **Contest Page (`/contest/*`):** Injects a floating Gate Analysis widget above the problem list.
- **Problem Page (`/problem/*`):** Injects a Monster Analysis widget detailing required stats.

---

## Hunter System

- **Hunter Rank:** Direct 1:1 mapping of Codeforces Rating (e.g., Newbie = E-Rank, Master = A-Rank, LGM = S-Rank).
- **Hunter Level:** A slow-moving lifetime progression metric. Weighted sum of Rating (20%), Diversity (20%), Exp (20%), Consistency (20%), and Combat Proficiency (20%). Rarely decreases.
- **Mana Power:** Active combat capability. Reacts quickly to recent performance. Weighted heavily toward current rating and recent problem weights.
- **Combat Proficiency:** Exponentially weighted sum of solved problems. Solving a 2300 problem gives massively more points than an 800 problem.
- **Skill Affinities:** 
  - Implementation -> Strength
  - DP -> Intelligence
  - Graphs -> Perception
  - Math -> Magic
  - Greedy -> Agility
  - Binary Search -> Strategy

---

## Statistics

- **Problems Defeated:** Total unique AC submissions.
- **Highest Monster Defeated:** Max problem rating solved.
- **Active Days / Streaks:** Consistency metrics.
- **Data Source:** Codeforces `user.status` and `user.rating` APIs.
- **Update Frequency:** On-demand via the "Sync" button (incremental updates).

---

## Backend Architecture

- **High-Level Flow:** REST API (Node.js/Express) receives request -> Queues job (BullMQ/Redis) -> Streams progress (SSE) -> MongoDB stores result.
- **No Raw Storage:** MongoDB Atlas 512MB limit forced a rule: The backend NEVER stores raw submissions permanently. It aggregates 50,000 submissions into frequency maps (e.g., `{"800": 150}`) in memory, saves the map, and drops the raw data.
- **Incremental Fetch:** Uses `lastSubmissionId`. If a user with 50,000 submissions solves 1 new problem, the backend fetches only that 1 submission and mathematically merges it into the frequency map (O(1) space).
- **Rate Limiting:** Collector employs smart back-off to respect CF's 1 req/sec limit.

---

## Hunter Engine

- **Pipeline:** 
  1. Synchronize (Validate Handle)
  2. Collect Battle Records (Fetch Submissions)
  3. Analyze Combat History (Fetch Rating Changes)
  4. Compute Weightage
  5. Compute Level & Mana
  6. Build Skill Profile
  7. Register Hunter (MongoDB)
- **Determinism:** The Engine is a pure function. Given the same CF data, it will always output the exact same Hunter Profile.

---

## Technical Stack

- **Extension Frontend:** Vanilla JS, Web Components (Custom Elements), Shadow DOM, CSS Variables (Glassmorphism). No React/Vue (keeps bundle size tiny).
- **Backend:** Node.js, Express.js.
- **Queue:** BullMQ, Redis.
- **Database:** MongoDB Atlas.
- **Real-time:** Server-Sent Events (SSE).

---

## Challenges Faced

- **CSS Bleeding:** Codeforces uses very aggressive global CSS. *Solution:* Shadow DOM encapsulation.
- **Massive Datasets:** Tourist has tens of thousands of submissions. *Solution:* Dynamic Programming-style state storage (incremental updates) and aggregated frequency maps.
- **API Rate Limits:** Codeforces blocks IPs that spam. *Solution:* Background BullMQ workers with strict concurrency limits.
- **Chrome Extension Quirks:** Manifest V3 background service workers go to sleep. *Solution:* State management pushed to local storage, and persistent SSE connections managed gracefully in content scripts.

---

## Interesting Engineering Decisions

- **Zero-Friction Auth:** Instead of OAuth or passwords, the extension scrapes the top-right header of Codeforces to find the logged-in user.
- **SSE over WebSockets:** Chosen because it's purely one-way (Server -> Client) for boot sequence progress, making it lighter and easier to scale than bi-directional WebSockets.
- **Vanilla JS Web Components:** React was rejected to keep the Chrome Extension blazing fast and under a few hundred kilobytes.

---

## Performance

- **Startup Time:** <5ms render time from Chrome Local Storage.
- **Backend Sync:** A user with 10,000 submissions syncs incrementally in <500ms.
- **Memory:** Shadow DOM ensures the browser isn't overwhelmed by heavy virtual DOM diffing.

---

## Privacy

- **Data Collected:** ONLY public Codeforces data (handle, submissions, rating).
- **Authentication:** None required. No passwords stored.
- **Security:** Fully read-only system. It cannot modify your Codeforces account.

---

## Installation

1. Install from Chrome Web Store.
2. Open Codeforces.com.
3. Done. The extension automatically detects your logged-in handle.

---

## Roadmap

- **Guilds:** Allowing users to form guilds and pool Mana.
- **Leaderboards:** Global Hunter Rankings based on Hunter Level, not just CF Rating.
- **Achievements:** Titles like "Dragon Slayer" for solving ten 2400+ rating problems.

---

## FAQ

**Q: Does this violate Codeforces rules?**
A: No. It uses the official public Codeforces API and only modifies the DOM visually on your local machine.

**Q: Will it slow down my contest?**
A: No. The extension relies on cached data during contests and defers all heavy calculations to our external backend server.

**Q: Does it modify my submissions?**
A: Impossible. The extension and backend are completely read-only.

**Q: Can I disable the animations?**
A: Yes, a minimal mode is planned in the extension options.

---

## Why Codeforces Users Will Love It

It turns the soul-crushing experience of a rating drop into a minor setback in a broader RPG journey. Your Hunter Level still goes up. Your Mana still charges. It provides dopamine for practice, not just for competition.

---

## Story Behind CF Hunter

Born out of the frustration of competitive programming burnout. The realization that CP is basically a hardcore RPG, but missing the UI and feedback loops that make RPGs addictive. Inspired heavily by the global phenomenon of *Solo Leveling*.

---

## Technical Highlights

- Aggregated $O(1)$ space complexity for lifetime submission histories.
- Flawless Shadow DOM CSS isolation against a 15-year-old legacy website.
- Seamless, unnoticeable background synchronization via BullMQ and SSE.

---

## Limitations

- Does not track Gym contests or private mashups (CF API limitations).
- Requires an active Codeforces account.

---

## Release Notes

**v1.0.0 (Launch Edition)**
- Core Engine deployed.
- Gate and Monster analysis live.
- Zero-friction authentication.

---

## Links

- **Chrome Web Store:** [Placeholder]
- **GitHub:** [Placeholder]
- **Discord:** [Placeholder]

---

## Assets

- **Screenshot 1:** Profile Page. *Caption: "Your standard CF Profile, Awakened."*
- **Screenshot 2:** Gate Analysis. *Caption: "Analyze the Threat Level before entering a Contest."*
- **Screenshot 3:** Terminal Boot Sequence. *Caption: "Synchronizing with the Hunter Association..."*

---

## One-Line Selling Points

1. Turn Codeforces into a real-life RPG.
2. You are the Hunter. Codeforces is the Dungeon.
3. Level up your coding skills like a Solo Leveling protagonist.
4. Stop stressing over rating drops; start building your Hunter Level.

---

## Tweet-Length Description

Tired of Codeforces rating anxiety? CF Hunter is a Chrome Extension that transforms Codeforces into a Solo Leveling style RPG. Fight Monsters, clear Gates, and track your Mana Power. Awaken your system today. #Codeforces #CompetitiveProgramming

---

## Elevator Pitch

**30 sec:** CF Hunter is a Chrome Extension and backend engine that overlays RPG mechanics onto Codeforces. It classifies problems as Monsters, contests as Gates, and tracks your lifetime progression as a Hunter, all wrapped in a stunning glassmorphic UI.

**1 min:** Competitive programming is tough, and rating drops cause massive burnout. CF Hunter fixes the feedback loop. By analyzing your public Codeforces data, our backend mathematically calculates your "Hunter Level", "Mana Power", and "Skill Affinities". The extension then injects a beautiful, Solo Leveling-inspired HUD into Codeforces. You're no longer just solving math problems; you're a Hunter clearing A-Rank Gates and slaying Dragons.

---

## Most Impressive Technical Facts

- Merges 50,000+ submissions incrementally in milliseconds using DP-like state storage.
- Operates a massive analytical engine entirely within the confines of a 512MB free-tier MongoDB cluster by aggressively dropping raw data.
- Achieves zero-friction authentication purely through intelligent DOM scraping.

---

## Things That Make CF Hunter Different

Unlike other CF extensions that just add more spreadsheets, graphs, or predicted ratings, CF Hunter completely changes the emotional experience of the platform. It doesn't just give you more data; it gives you a narrative. It is an immersive gamification layer built with premium aesthetic standards.

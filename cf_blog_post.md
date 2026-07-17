# CF Hunter System - Comprehensive Project Reference (For AI Context)

This document contains every technical, conceptual, and design detail of the **CF Hunter System**. Use this as the core context to generate a highly creative, engaging, and hype-building blog post for the Codeforces community.

---

## 1. Core Vision & Philosophy
The **CF Hunter System** is an Augmented Reality (AR) Operating System built on top of Codeforces, heavily inspired by the manhwa/anime **Solo Leveling**. 

**The Golden Rule:** The webpage is reality. The SYSTEM is another layer of reality projected on top of it.
- It is NOT a Codeforces redesign, dashboard, or browser theme.
- It is a holographic SYSTEM that only the "Hunter" (the user) can see.
- The extension does not alter the underlying DOM of Codeforces. It floats over the UI, injecting immersive glassmorphism panels, scanlines, and neon holographic text, making the competitive programming grind feel like a high-stakes RPG.

## 2. The Codeforces -> Solo Leveling Mapping
Everything in the Codeforces ecosystem has been translated into the Solo Leveling universe:
- **Hunters:** Codeforces Users.
- **Monsters:** Codeforces Problems. The difficulty/rating of a problem represents the Monster's threat level.
- **Battles:** Accepted Submissions. Defeating a monster grants Combat Proficiency.
- **Gates (Dungeons):** Codeforces Contests. 
  - Div 4 = E-Class Gate
  - Div 3 = D-Class Gate
  - Educational Rounds = Training Gates
  - Div 1 / Global Rounds = National-Level / S-Class Gates
- **Hunter Rank (E-Rank to S-Rank):** This strictly correlates to official Codeforces Rating. The System respects Codeforces' official authority (The Hunter Association).

### Skill Affinities
The SYSTEM analyzes the tags of the problems you solve and maps them to RPG stats. Whichever stat you have the most points in becomes your **Hunter Class** (e.g., "Strength-Type Hunter"):
- Implementation / Brute Force $\rightarrow$ Strength
- DP / Combinatorics $\rightarrow$ Intelligence
- Graphs / Trees $\rightarrow$ Perception
- Math / Number Theory $\rightarrow$ Magic
- Greedy / Sortings $\rightarrow$ Agility
- Binary Search / Two Pointers $\rightarrow$ Strategy

## 3. The Math Behind the System (Gamifying CP)
To truly bring the Solo Leveling fantasy to life, the System doesn't just read your rating—it calculates your actual combat experience using complex algorithms. This prevents users from "farming" easy problems to look strong.

### A. Combat Proficiency
Combat Proficiency represents your true battle experience. It is calculated by assigning an exponentially growing weight to monsters based on their threat level (rating).
- **Formula:** $\Sigma (\text{Weight}(R) \times \text{SolvedCount}(R))$
- **Weights:** An 800-rated problem has a weight of `1`. A 1500-rated problem is `19`. A 2000-rated problem is `63`. A 2300-rated problem is `115`. Beyond 2300, it scales exponentially by roughly `1.21x` per 100 points.
- **Why?** This guarantees that a Grandmaster defeating one 2400-rated Boss Monster gains more proficiency than a newbie farming hundreds of 800-rated slimes. 

### B. Hunter Level (Scale 0 - 100)
Your Hunter Level represents your total journey as a Hunter. It rewards consistency, exploration, and time invested. 
- **Formula (Weighted Sum):**
  - `20% Rating` (Normalized up to 4000)
  - `20% Combat Proficiency` (Normalized up to 50,000)
  - `20% Contest Experience` (How many gates you've survived)
  - `20% Problem Diversity` (Breadth of difficulties cleared)
  - `20% Active Days` (Normalized up to 1000 days)
- **Why?** Two hunters might have an identical 1600 rating. However, if one achieved it in 2 months while the other has been battling consistently for 3 years (1000 active days), the veteran will have a significantly higher Hunter Level.

### C. Mana Power (Scale 0 - 5000)
Mana Power represents the System's estimate of your *current, raw combat capability*. It asks the question: "How dangerous is this Hunter right now?"
- **Formula (Weighted Sum):**
  - `35% Rating`
  - `25% Combat Proficiency`
  - `15% Contest Experience`
  - `15% Problem Diversity`
  - `10% Active Days`
- **Why?** Unlike Hunter Level (which is a lifetime achievement metric), Mana is heavily skewed toward raw Rating and high-level Combat Proficiency. You cannot fake high Mana without actually being strong enough to clear high-rated monsters.

## 4. The Architecture (Backend + Extension)
The system is divided into three distinct parts:

### A. The Extension (The Eyes & Visualization)
- **Tech Stack:** Vanilla JavaScript, CSS3, Web Components (Shadow DOM).
- **Visual Design:** 
  - Deep space-blue (`#050a14`) and holographic glass panels (`rgba(2, 5, 12, 0.9)`) with blur filters.
  - Glowing accents in bright Cyan (`#1EDBFF`) and Monarch Purple (`#9D00FF`).
  - Text uses `Share Tech Mono` to simulate terminal interfaces.
  - Micro-animations: "Chromatic Glitch" effects, sweeping SVG scanlines, and a custom `text-transform: lowercase` for `[i]` info tooltips.
- **Security & Scope:** Runs exclusively on `codeforces.com`. Injected via Shadow DOM to prevent CSS collision.

### B. The Backend Engine (The Brain & Computation)
- **Tech Stack:** Node.js, Express, Server-Sent Events (SSE).
- **The Registration Pipeline:** Processing thousands of submissions in a Chrome extension would freeze the browser. Thus, the Node.js backend handles all the math. When a user is scanned, the backend creates a job and uses **Server-Sent Events (SSE)** to stream its progress live to the extension. The HUD literally types out:
  1. *Waking up SYSTEM...*
  2. *Synchronizing with Hunter Association...*
  3. *Collecting Battle Records...*
  4. *Analyzing Combat History...*
  5. *Computing Mana...*

### C. The Database (The Memory)
- **Tech Stack:** MongoDB.
- **Incremental Updates:** Raw Codeforces API data is never permanently stored, only the computed "Hunter Profile". If you solve 5 new problems today, the backend fetches only those 5 submissions, updates your Combat Record, and re-saves the profile. 

## 5. Context Awareness & System Verdicts
The HUD is fully context-aware:
- **Profile Pages:** Renders the "Hunter Analysis" window (Avatar, Level, Mana Gauge, Stats). When viewing another user, the System compares your Mana to their Mana and issues a **System Verdict**:
  - *Target is significantly weaker.*
  - *Comparable Combatant.*
  - *Threat Level Catastrophic. Retreat Advised.* (Styled in glowing danger red).
- **Problemset/Contest Pages:** Renders the "Gate Analysis" window (Duration, Threat Level: "Catastrophic Risk", System Projections: "Extreme Level-Up Potential").

## 6. The Vibe
The ultimate goal of this extension is to make the competitive programming grind feel epic. The transition from an unrated newbie to an International Grandmaster shouldn't just be a line graph changing colors. It should feel like clearing an S-Rank Gate and standing atop the Hunter Association. 

**"Arise."**

# CF Hunter System: Complete Technical Architecture & Design Document

Welcome to the internal workings of the **CF Hunter System**. This document breaks down exactly how the Chrome Extension, the Backend Engine, and the Database work together to transform Codeforces into a real-life RPG experience inspired by *Solo Leveling*. 

---

## 1. The Core Concept

At its heart, the system seamlessly maps competitive programming elements to RPG mechanics without ever modifying the underlying Codeforces data. It acts as a "System HUD" laid over reality.

| Codeforces Concept | System Translation | Simple Explanation |
| :--- | :--- | :--- |
| **Codeforces User** | **Hunter** | You, the player. |
| **Problem** | **Monster** | An entity you must defeat (solve) to gain EXP. |
| **Contest** | **Gate / Dungeon** | An event where Monsters spawn and must be cleared within a time limit. |
| **CF Rating** | **Hunter Rank** | Your official ranking (E-Class through S-Class). |
| **CF Tags (DP, Graph)** | **Skill Affinities** | Your magical stats (Intelligence, Perception, Strength). |

---

## 2. High-Level Architecture

The system is split into three main pillars:

### A. The Chrome Extension (The "Client" or "HUD")
This is the visual layer you interact with on Codeforces. It is completely localized to your browser.
- **Page Detection:** It constantly checks what page you are on (Profile, Contest, or Problem).
- **DOM Injection:** It injects futuristic, glassmorphic UI elements (the HUD) directly into the Codeforces website.
- **Real-time Threat Analysis:** It calculates immediate threats (e.g., comparing your rank to a problem's difficulty) dynamically on the frontend.

### B. The Backend Engine (The "Architect")
A Node.js server that handles the heavy lifting.
- **Data Collector:** It securely fetches public Codeforces API data (your rating, all your submissions, your contest history).
- **Pure Computation:** It calculates complex, lifetime metrics (like Mana Power and Hunter Level) so the Extension doesn't have to freeze your browser doing heavy math.
- **Job Queue:** Calculations are done asynchronously. When you register, a background job processes your massive submission history without blocking the system.

### C. The Database (MongoDB Atlas)
A lightweight, fast NoSQL database.
- **Storage Rule:** We *never* store raw Codeforces API payloads permanently to save space. We only store the **final computed Hunter Profiles**.
- **Incremental Refreshes:** The database tracks the ID of your last submission. The next time you refresh your profile, it only fetches *new* submissions since that ID, making updates lightning fast.

---

## 3. How Features & Metrics Are Calculated

The Backend Engine calculates your stats deterministically. Nothing is random; every number is a mathematical reflection of your public Codeforces data.

### 3.1. Combat Proficiency (Weightage Score)
*What it is:* A measure of your raw battle experience.
*How it's calculated:* Solving harder problems gives exponentially more points. 
- Solving an 800-rated problem (a Goblin) gives 1 point.
- Solving a 1600-rated problem (a Dragon) gives 25 points.
- Solving a 2300-rated problem gives 115 points.
*Calculation:* The system groups all your solved problems by rating, multiplies the count by the rating's weight, and sums them up.

### 3.2. Hunter Level (Lifetime Progression)
*What it is:* A slow-moving metric representing your lifetime achievements. It rarely decreases.
*How it's calculated:* It is a weighted average of 5 pillars (each normalized from 0 to 100):
- **20%** Rating Score
- **20%** Problem Diversity (solving different ratings, not just spamming 800s)
- **20%** Contest Experience (how many contests you've done)
- **20%** Active Days (consistency)
- **20%** Combat Proficiency
*Example:* Even if your Codeforces rating drops because of one bad contest, your Hunter Level will remain stable because it values your lifetime consistency and problem-solving history.

### 3.3. Mana Power (MP)
*What it is:* Your current, active combat capability. It changes much faster than Hunter Level.
*How it's calculated:*
- **35%** Rating Score
- **25%** Combat Proficiency
- **15%** Contest Experience
- **15%** Problem Diversity
- **10%** Active Days
*Example:* If you suddenly solve a bunch of hard problems or spike in rating, your Mana Power will surge dramatically, indicating you are "overflowing with energy" for current combat.

### 3.4. Skill Affinities
*What it is:* Your unique combat style based on the types of problems you solve.
*How it's calculated:* The engine counts the tags on every problem you've ever solved and maps them:
- **Implementation / Brute Force** → **Strength**
- **Dynamic Programming** → **Intelligence**
- **Graphs / Trees** → **Perception**
- **Math / Number Theory** → **Magic**
- **Greedy / Two Pointers** → **Agility**
- **Binary Search / Data Structures** → **Strategy**
*Example:* If you solve 500 DP problems and 10 Math problems, the system will classify you as a **"Mage-Type Hunter"** with massive Intelligence stats.

---

## 4. Extension-Side Interactions (The HUD)

When you browse Codeforces, the Extension runs localized scripts to analyze your immediate surroundings.

### 4.1. Gate Analysis (Contests)
When you visit a Contest page, the system classifies it as a Gate:
- **Div. 4** = D-Rank Gate
- **Div. 3** = C-Rank Gate
- **Div. 2** = B-Rank Gate
- **Div. 1 + 2** = A-Rank Gate
- **Div. 1 / ICPC** = S-Rank Gate

**Relative Threat Level:** The extension compares the Gate's Rank directly against your Hunter Rank. 
- *Example:* If you are a C-Rank Hunter entering an A-Rank Gate (Div 1+2), the system will flash a **CATASTROPHIC RISK** (Red) warning and project an *Extreme Level-up Potential* if you survive. If you are an S-Rank Hunter in a D-Rank Gate (Div 4), it will show **NO THREAT** (Green).

### 4.2. Monster Analysis (Problems)
When you open a Problem page, the extension scans it as a Monster.
- **Classification:** An 800-rated problem is a Goblin. A 1600-rated problem is a Dragon. A 3000+ rated problem is a Monarch.
- **Combat Assessment:** It compares the Monster's rating to your Codeforces rating. If the monster is exactly your rating, it's an **EQUAL COMBATANT**. If it's 200+ points higher, it's a **DANGEROUS COMBATANT**.
- **Required Affinities:** It reads the problem's tags and tells you what stats you need (e.g., "Requires High Intelligence and Agility").

---

## 5. Database Storage & Optimization

Because competitive programmers can have tens of thousands of submissions, storing every submission individually would crash our free-tier database. 

**How we store data efficiently:**
We use a technique called **Aggregation**. Instead of storing:
`[Problem 1 (800), Problem 2 (800), Problem 3 (900)]`

We store a summarized **Monster Distribution Map**:
```json
{
  "monsterDistribution": {
    "800": 2,
    "900": 1
  }
}
```
This means a Hunter with 10 submissions and a Hunter with 50,000 submissions both take up the *exact same amount of database space*! 

**The Update Cycle:**
1. You request a profile update via the Extension.
2. The Backend Engine checks the `lastSubmissionId` in your database profile.
3. It asks Codeforces *only* for submissions that happened after that ID.
4. It mathematically merges the new data into your existing summarized maps.
5. It recalculates your Hunter Level and Mana Power in milliseconds.
6. The database saves the new summary, and the Extension HUD updates beautifully on your screen.

---

## 6. Deep Dive Technicalities

For the system architects and engineers, here is a look under the hood at the complex mechanisms powering the CF Hunter System.

### 6.1 Backend Technical Details
The Node.js Backend is designed for high concurrency and determinism without blocking.

- **Job Queueing (BullMQ & Redis):** Computing a Hunter's profile requires parsing up to 50,000 submissions. To ensure the API remains blazing fast (returning a response in <200ms), heavy computations are offloaded to a **Background Job Queue**. When you request a sync, the server instantly returns a `202 ACCEPTED` status and a Job ID, moving the heavy lifting to a background worker.
- **Server-Sent Events (SSE):** While the background worker processes the profile, how does the frontend know what's happening? Instead of making the frontend constantly "ask" the server (Polling), we use a real-time gateway via **SSE**. The server actively pushes events (e.g., `COLLECTING_BATTLE_RECORDS`, `COMPUTING_MANA`) directly to the extension, triggering the futuristic boot sequence animation you see in the HUD.
- **Rate Limiting & Safety:** Codeforces limits API requests to ~1 per second. If thousands of hunters sync at once, the system would get IP-banned. The Backend Collector uses intelligent, back-off retry logic to throttle its own requests, ensuring perfect compliance with Codeforces limits.
- **No Raw Storage Policy:** Due to our MongoDB Atlas limits (512MB free tier constraint), the engine operates purely in-memory. Raw JSON payloads from Codeforces are streamed into the Engine, summarized into the `monsterDistribution` map, and immediately discarded. The raw data *never* touches the permanent database.

### 6.2 Extension Technical Details
The Chrome Extension focuses heavily on isolation and performance.

- **Shadow DOM for CSS Isolation:** Codeforces has very old, generic CSS (like styling all `div` or `table` elements globally). If we injected our modern Glassmorphism CSS directly into the page, it would destroy the Codeforces layout, and their CSS would destroy ours. To solve this, all UI components (like the HUD and Gate Analysis windows) are injected using the **Shadow DOM**. This creates an impenetrable barrier—our glowing cyan animations cannot leak out, and Codeforces' legacy CSS cannot leak in.
- **Web Components:** Every widget (the Mana Gauge, the System Header, the Hunter Profile) is built as a native Custom HTML Element (e.g., `<system-frame>`). This allows the codebase to remain highly modular without using heavy frameworks like React or Vue, keeping the extension incredibly lightweight.
- **Local Chrome Storage (Caching):** Re-fetching your profile from our backend on every page load would be slow. The extension uses `chrome.storage.local` to cache your parsed Hunter Profile. The HUD renders instantly from the local cache within 5 milliseconds of opening a tab. It only hits the network if you actively click the "Sync" button.
- **Dynamic Page Detection:** Instead of running heavy scripts on every page, a `pageDetector.js` module instantly analyzes the URL and DOM upon load. It immediately shuts off features that aren't needed (e.g., disabling the Monster Analysis engine if you aren't actively on a `/problem/` URL path).

### 6.3 Server Optimization & DP-Like Data Storage
Handling competitive programmers with over 50,000 lifetime submissions requires extreme algorithmic efficiency.
- **Dynamic Programming (DP) State Storage:** Instead of recalculating your Hunter Level from scratch every time you solve a new problem, the backend stores your profile as a "Memoized State" (just like in DP). Your database document tracks the `lastSubmissionId`. When you sync, the server only fetches submissions *newer* than this ID, mathematically merging them into your existing state.
- **Aggregated Maps over Arrays:** The backend never stores an array of your solved problems. Instead, it aggregates them into frequency maps (e.g., `monsterDistribution: { "800": 150, "1600": 45 }`). This ensures that $O(N)$ space complexity becomes $O(1)$ constant space, regardless of how many problems you solve.

### 6.4 Zero-Friction Authentication (No Login Required)
How does the system know who you are without asking for a password or OAuth login?
- **DOM Scraping Engine:** The extension includes a highly specialized `profileScraper.js` script. Codeforces embeds the currently logged-in user's handle directly in the top-right header of the webpage.
- **Silent Extraction:** The script silently reads the DOM (`document.querySelectorAll('.lang-chooser a')`), locates the anchor tag linking to `/profile/`, and extracts the text content. It instantly binds your browser session to that Hunter profile, achieving completely secure, zero-friction authentication without you ever typing a password.

### 6.5 The "Analyze New Hunter" (Registration) Flow
When a Codeforces user is analyzed by the system for the very first time, an orchestrated event flow occurs:
1. **Trigger:** The Extension scrapes the handle and sends a `GET /hunter/:handle` request to the backend.
2. **Queueing:** The backend recognizes the hunter doesn't exist, queues a `REGISTER` job via BullMQ, and immediately replies to the extension with a `202 ACCEPTED` and a `jobId`.
3. **SSE Connection:** The extension instantly connects to an SSE (Server-Sent Events) stream listening to that `jobId`.
4. **Boot Sequence:** As the backend background worker fetches data from Codeforces and processes it, it pushes events (`SYNCHRONIZING`, `COLLECTING_BATTLE_RECORDS`, `COMPUTING_MANA`) through the SSE stream.
5. **Awakening:** The Extension translates these incoming network events into the beautiful, hacking-style terminal animation on your screen. When the backend emits the final `READY` event with the computed profile payload, the animation flashes "SYSTEM AWAKENED", caches the profile locally, and seamlessly transitions into the RPG HUD.

---

### Summary
By separating the beautiful, animated, Shadow DOM-isolated frontend from the heavy, queue-driven, mathematical backend, the CF Hunter System provides a seamless, immersive RPG experience without ever slowing down your competitive programming workflow!

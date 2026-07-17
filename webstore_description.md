# CF Hunter System - Web Store Description

**CF Hunter System** is a next-generation, Solo Leveling-inspired holographic overlay for Codeforces. Built for competitive programmers who want to gamify their coding journey, this extension transforms standard Codeforces profiles into an immersive, RPG-style "Hunter HUD".

Watch your stats come alive as the system analyzes your competitive programming performance, assigns you a Hunter Class, tracks your milestones, and evaluates your threat level in real-time. Whether you are an E-rank novice or an S-rank National Level Hunter, the System is watching.

### Key Features:
- **Immersive Holographic UI:** Experience a stunning, glassmorphism HUD that overlays directly onto Codeforces profiles.
- **Hunter Classification:** Get assigned an RPG-style rank (E-Rank to S-Rank) and Class based on your Codeforces rating and activity.
- **Real-Time Data Streaming:** Watch as the System connects to the Hunter Association backend to actively scan and synchronize battle records (contest history).
- **Gamified Stats:** Track your "Mana" (activity), "Stamina", and "Strength" dynamically generated from your coding performance.
- **Milestone Tracking:** The System monitors your growth and alerts you when you reach new thresholds.

---

## Privacy & Permissions Justification

To provide this seamless, immersive experience securely, the CF Hunter System requires a few specific permissions. We value your privacy—**no personal data is sold or tracked outside of your Codeforces public profile.**

Here is exactly why Chrome requests these permissions:

### 1. `storage`
**Why it's needed:** We use your local browser storage to cache the Hunter profiles you've already scanned.
**Benefit to you:** This prevents the extension from having to re-fetch data from Codeforces every single time you refresh a page, keeping the HUD lightning-fast and ensuring we respect Codeforces API rate limits. 

### 2. `contextMenus`
**Why it's needed:** This allows us to add a quick-access shortcut to your right-click menu.
**Benefit to you:** You can instantly interact with the Hunter System or toggle the HUD without needing to click the extension icon in your toolbar.

### 3. `https://codeforces.com/*` (Host Permission)
**Why it's needed:** This gives the extension permission to run its scripts exclusively on Codeforces pages.
**Benefit to you:** This is necessary to inject the visual holographic HUD directly over the standard Codeforces profile page. The extension remains completely inactive on all other websites you visit.

### 4. `https://cf-hunter-system.onrender.com/*` (Host Permission)
**Why it's needed:** This allows the extension to communicate with our secure backend server.
**Benefit to you:** Our custom backend handles the complex math to generate your Hunter stats, bypasses strict browser limitations to process your contest history, and streams the cool "scanning" animation directly to your screen in real-time.

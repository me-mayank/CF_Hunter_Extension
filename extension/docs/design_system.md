# SYSTEM Design System

This document outlines the UI guidelines and architectural components for all visual interfaces in the Hunter System extension.

## 1. Palette

We use a glowing, navy/cyan holographic aesthetic.

- **Background (`--sys-bg`)**: `#050a14` (Deep navy black)
- **Primary Accent (`--sys-accent`)**: `#3ad6ff` (Electric blue)
- **Text Primary (`--sys-text`)**: `#d8f0ff` (Off-white / pale blue)
- **Text Muted (`--sys-text-muted`)**: `#7e99b0` (Desaturated blue/gray)
- **Glow Soft (`--sys-glow`)**: `rgba(58, 214, 255, 0.4)`
- **Glow Strong (`--sys-glow-strong`)**: `rgba(58, 214, 255, 0.7)`

## 2. Typography

All numerical data and structural headings use a technical/monospace font.

- **Primary Font**: `Share Tech Mono`, falling back to standard `monospace`.
- **Formatting**: All numbers greater than 999 must include thousands separators (e.g. `1,418`) via `toLocaleString()`.
- **Headings**: Bracketed, all caps (e.g., `[ HUNTER STATUS ]`, `[ SYSTEM ONLINE ]`).

## 3. Core Components

### `.system-panel`
The base container class for any floating SYSTEM UI (HUD, Milestone notifications, Threat analysis overlays).
- **Features**: Zero border-radius, backdrop blur, subtle inner/outer box shadows.

### Angular Corner Brackets
The `.system-panel` relies on pseudo-elements (`::before` and `::after`) combined with `.system-panel-inner-brackets` to draw the four glowing 90° corner brackets, creating a sci-fi targeting reticle look.

### Animations
- `.animate-materialize`: A 0.4s entrance animation combining a scale-up, fade-in, and blur-removal to mimic holographic projection.
- `.scanline-sweep`: A 0.8s top-to-bottom laser sweep used during boot and monster scanning.
- `.badge-pulse`: A slow, continuous 3s opacity pulse for the ONLINE badge.

### Javascript Utilities
Located in `content/hud/animations.js`:
- `countUp(el, from, to, duration)`: Animates numeric fields rolling up to their final value.
- `typeText(el, text, speed)`: Terminal-style typewriter effect, throttled to play UI ticks via the Web Audio API on every 2nd character.
- `runBootSequence(container, contentEl, onComplete)`: Multi-stage terminal initialization sequence (Connecting... Progress Bar... Scanline).

## 4. Terminology Dictionary

No raw Codeforces vocabulary should ever leak into the UI. Always use `shared/terminology.js` to translate raw strings.

### Rank Translation (`HUNTER_RANK_TIERS`)
- newbie / pupil → E-Rank Hunter
- specialist → D-Rank Hunter
- expert → C-Rank Hunter
- candidate master → B-Rank Hunter
- master / international master → A-Rank Hunter
- grandmaster / international grandmaster → S-Rank Hunter
- legendary grandmaster → National Level Hunter

### Tag Translation (Skill Affinities)
- Math, Geometry, Probabilities → **Magic**
- DP → **Intelligence**
- Graphs, Trees, DFS → **Perception**
- Implementation, Brute force, Constructive → **Strength**
- Greedy, Sortings, Two Pointers → **Agility**
- Binary Search, Data Structures, Divide & Conquer → **Strategy**

## 5. Gamification Mechanics (NOT Real Statistics)

**Guardrail: Data Integrity**
The Hunter Engine explicitly does not store global problem submissions (Clear Rates, Average Attempts). Any such stats are fundamentally unfeasible ("Bucket C" data). To maintain trust in real data, gamification mechanics are clearly visually separated and derived entirely from the Threat Level.

### XP Rewards & Penalties
XP is a fixed formula per threat tier:
- VERY_EASY: +10 XP / -1 Penalty
- EASY: +25 XP / -2 Penalty
- EQUAL: +50 XP / -5 Penalty
- DANGEROUS: +100 XP / -10 Penalty
- EXTREME: +250 XP / -25 Penalty
- CATASTROPHIC: +500 XP / -50 Penalty

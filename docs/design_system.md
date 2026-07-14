# Hunter System UI - Design System & Architecture

This document tracks UI logic rules and narrative mapping decisions for the Hunter System extension.

## 1. Scale Distinctions: Rating vs. Mana Power

There is a critical distinction between a Hunter's Codeforces Rating and their Mana Power. **Mana Power is a weighted composite** (rating + Combat Proficiency + Contest Experience + Problem Diversity + Active Days) normalized to a 0–5000 scale. **Codeforces Rating** is the standard Elo scale (0–3800). Because these scales diverge significantly for active Hunters, they must be compared correctly.

### Monster Threat Classification (Rating vs. Rating)
- **Rule**: Monster Threat Classification compares the problem's rating against the Hunter's **Codeforces rating** (same scale).
- **Rationale**: Both live on the Codeforces rating scale. Comparing a problem's rating to a Hunter's inflated Mana Power would incorrectly flag extremely difficult problems as "Safe".
- **Visuals**: The Threat Analysis panel displays "Hunter MP" as a secondary flavor stat to show their overall power, but the actual Threat tier and diff calculations are rating-based.

### Hunter-vs-Hunter Recommendation (Mana vs. Mana %)
- **Rule**: Hunter-vs-Hunter Recommendation compares **Mana Power using a RELATIVE PERCENTAGE difference**, not fixed point thresholds.
- **Rationale**: Mana Power captures the holistic strength of a Hunter, making it the conceptually correct metric for Hunter-to-Hunter combat. We use relative percentages (e.g. `+30%`) because Mana Power's absolute scale is backend-config-dependent (system_config pillar weights) and not guaranteed stable across engine versions. Using fixed points (e.g. `+350 MP`) would break if the backend alters the weighting formula.

## 2. Hunter Analysis Panel Rules

### Hunter Type (Archetype)
The Hunter's Type is determined purely by whichever skill has the highest accumulated score in their `skillAffinities` object, mapped strictly client-side for flavor:
- `Strength` → "Warrior-Type Hunter"
- `Agility` → "Assassin-Type Hunter"
- `Intelligence` → "Mage-Type Hunter"
- `Perception` → "Ranger-Type Hunter"
- `Magic` → "Sorcerer-Type Hunter"
- `Strategy` → "Tactician-Type Hunter"
- `Insight` (Future) → "Oracle-Type Hunter"

### Short-Form Recommendations
Instead of verbose paragraphs, the SYSTEM uses punchy 2-4 word labels, color-coded by threat/status.

**For Self Profile (Based on Rank Progress):**
- `>= 90%`: "Promotion Imminent" (Purple)
- `>= 75%`: "Rapid Ascension" (Cyan)
- `>= 25%`: "Steady Growth" (Green)
- `> 5%`: "Needs More Battles" (Grey)
- `<= 5%`: "Plateau Detected" (Orange)

**For Relative Profile (Hunter vs Hunter MP Diff):**
- `> +60%`: "Retreat Recommended" (Red)
- `> +30%`: "High Risk Hunter" (Yellow)
- `> +10%`: "Dangerous Hunter" (Yellow)
- `>= -10%`: "Comparable Hunter" (Cyan)
- `< -10%`: "Below Your Rank" / "Far Below Your Rank" (Green)

## Typography Scale
We use a 3-tier scale for the HUD typography to create proper focal hierarchy:
- **Tier 1 (Hero)**: 38px, bold, heavy glow (`.sys-tier-1`). Use for one focal element per section.
- **Tier 2 (Supporting)**: 18px, medium (`.sys-tier-2`). Use for context directly tied to the hero.
- **Tier 3 (Ambient)**: 14px, muted color (`.sys-tier-3`). Use for labels, references, and satellite chips.

# Backend Change Requests for Threat/Hunter Analysis Refactor

This document tracks schema and computation changes requested for the backend API (`/hunter/:handle`) to support the new System UI features.

## 1. Expand Skill Affinities Map with "Insight"
**Status:** PROPOSED  
**Component:** `engine/skillAffinities.js`

**Justification:** The UI is designed to render whichever tags the backend returns. The Codeforces problemset contains tags related to `binary search`, `math`, etc. We propose updating the backend `skillAffinities` engine to compute a 7th skill, "Insight", mapping specific problem tags to it to further flesh out the RPG gamification.

**Proposed Change:**
Return `"Insight": <score>` alongside the existing 6 skill affinities.

## 2. Add Peak Mana Power
**Status:** PROPOSED  
**Component:** Hunter Profile Schema

**Justification:** The Hunter Analysis screen wants to display a Hunter's highest-ever recorded Mana Power to show how far they might have fallen or their historic peak. Currently, the API only returns `manaPower` (current).

**Proposed Change:**
Add `highestManaPower: <number>` to the Hunter Profile schema, tracking the all-time maximum mana power achieved by the user.

## 3. Add Dungeon Clears
**Status:** PROPOSED  
**Component:** Hunter Profile Schema

**Justification:** The Hunter Analysis screen requires a count of "Dungeon Clears" (i.e. Contests Participated). Currently, the API returns `contestExperienceScore`, which is a derived score, but not the raw count of contests the Hunter has entered/cleared.

**Proposed Change:**
Add `contestsParticipated: <number>` or `dungeonClears: <number>` to the Hunter Profile schema.

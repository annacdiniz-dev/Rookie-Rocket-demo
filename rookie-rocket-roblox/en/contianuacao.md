> English translation of [`contianuacao.md`](../contianuacao.md). The Portuguese file is the original; identifiers, paths and code are unchanged. This note describes the earlier seated Friendship 7 mission (Phase 15), which was later replaced by the Rookie Rocket missions.

# Continuation — Friendship 7 mission (missaoUm.md)

Updated on 2026-11-14. The `missaoUm.md` spec is implemented and tested in Studio. **Nothing was committed.**

## Done
- **Phase 15:** `build/phase15_friendship7.luau`, which installs the scripts from `build/mission/`. It is already in `run_in_studio.luau`.
- **Phase 8:** CrewAccess ignores the prompts of anyone who has `MissionActive`.
- **Docs updated:**
  - `IMPLEMENTATION.md`: a "Friendship 7 mission" section with the playtest results.
  - `CLAUDE.md`: Phase 15 in the table and the mission playtest.
  - `assets/LICENSES.md`: the 8 ProSoundEffects sounds.
- **Playtest in Studio (1 player):**
  - Task 1: looking, fuel and stabilization.
  - Task 2: wrong and right code, static and paper.
  - Task 3: jettison → failure → retry; retain + hold and release.
  - Final summary and abort on standing up.
  - Console without errors.
- **Fixes made during the test:**
  - Text of the button name plates (orientation).
  - Camera turns to the console on start.
  - White static and frozen static.
  - Duplicated strip in the summary.

## Pending
1. **Tests still missing:**
   - A real mouse click and touch on mobile. The test used the remotes.
   - Two players at once (CDR + PLT), in Test → Clients and Servers.
   - EJECT, and the time and fuel failures in Play.
2. **For the user:**
   - Save the place in Studio (Ctrl+S).
   - Commit, if you want.
   - New files: `build/phase15_friendship7.luau`, `build/mission/`, `assets/LICENSES.md` and this file.
3. **Possible adjustments:** the DU 3 screen shows "STANDBY" behind the final summary (cosmetic).

## How to rebuild
1. Serve the folder: `cd build && python3 -I -m http.server 8765 --bind 127.0.0.1`.
2. Run `run_in_studio.luau` in Edit. If only Phase 15 changed, it can run alone, because it does not move parts from other phases.

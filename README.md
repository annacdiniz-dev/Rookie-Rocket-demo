# Rookie Rocket

**Fly two real NASA missions, make the calls the astronauts made, and learn the science behind them.**

Rookie Rocket is our entry for the **NASA Space Apps Challenge 2026 · Space Mission Design Game**. You are a rookie astronaut on your first day at a space agency inspired by the Kennedy Space Center. You meet your guide, walk through a museum of real exhibits, pack your spacecraft under a strict weight limit, and then fly:

- **Phase 1 · Project Mercury (Friendship 7, 1962):** take manual control, survive the radio blackout, and decide what to do about the heat shield alarm.
- **Phase 2 · International Space Station:** dock Zarya to Unity (STS-88), fix a slack solar array on a spacewalk (STS-97), and seal a 2 mm leak (Soyuz MS-09).

Every mission ends with the science you just practiced and a card of the real mission, with an official NASA photo and sources.

| | |
|---|---|
| ▶ **Play the web demo (no login, no install)** | https://annacdiniz-dev.github.io/Rookie-Rocket-demo/ |
| 🎮 **Full game on Roblox** | https://www.roblox.com/share?code=a84324d6a84b554796b4115f8931b4ff&type=ExperienceDetails&stamp=1794753740191 |
| 🌍 Languages | English and Portuguese, switchable at any time |
| 📱 Devices | Desktop and mobile (touch, portrait and landscape) |
| 👥 Audience | Ages 10 to 17 |

---

## What is in this repository

This repository holds the two halves of the project side by side.

| Path | What it is | Who it is for |
|---|---|---|
| **`/` (root)** | The **web demo**: a 3D, Roblox-style version of the game that runs in any browser. Plain HTML, CSS and JavaScript, no build step, no account. | Judges and anyone who wants to play right now |
| **[`rookie-rocket-roblox/`](rookie-rocket-roblox/)** | The **Roblox project**: the Luau scripts, map generators, specs and the place file of the full multiplayer game. | Developers who want to see how the Roblox experience is built |

The web demo exists because a Space Apps submission has to be playable without a login. It follows the Roblox game's own mission data, so both tell the same story with the same numbers.

```
Rookie-Rocket-demo/
├── index.html            ← the web demo (open this)
├── jogo.js               ← 3D world, characters, physics, both missions
├── dados.js              ← every number and every text, in English and Portuguese
├── estilo.css            ← interface and mobile layout
├── lib/                  ← three.js r128 and fonts, vendored
├── nasa/                 ← official NASA photos used by the exhibits and cards
├── versao-anterior/      ← the first 2D prototype, kept for history
└── rookie-rocket-roblox/ ← the Roblox project (see below)
```

---

## Part 1 · The web demo

### Run it

- **Online:** open https://annacdiniz-dev.github.io/Rookie-Rocket-demo/
- **Offline:** download the repository and open `index.html`. It works from the file system; nothing needs to be installed or served.

Pick a language, type a name, choose a character and press play.

### The world

| # | Area | What you find there |
|---|---|---|
| 01 | **Reception** | Marcos Pontes, your mission guide, greets you by name. A welcome screen, a tilted Earth globe, space paintings, and a kiosk that links to the official Roblox game |
| → | Hallway 1 | Neon arrows and signs to the museum |
| 02 | **Museum · Kennedy Space Center Visitor Complex** | Six exhibits with real NASA photos and facts: Rocket Garden, Sigma 7 on a Redstone, Mercury Mission Control, the Astronaut Hall of Fame, **Atlantis tilted at 43.21° with its payload bay doors open**, and a **Saturn V hanging horizontally** |
| → | Hallway 2 | The boarding hallway, on the wall opposite the entrance |
| 03 | **Hangar** | The RR-01 rocket, stairs to a platform, an elevator with call buttons, the access arm and the hatch that starts the missions |

Movement uses Roblox defaults so the demo feels like the real game: 1 unit is 1 stud, blocky R6-style characters, studs on the floor, JumpPower 50, Gravity 196.2, and a slightly faster WalkSpeed of 22.

### How a mission works

Both phases share one flow:

```
Mission Flight Manifest (mission → equipment) → 12 s countdown
  → Task 1 → Task 2 → Task 3 → congratulations + what you learned
  → result with stars → the real mission card (added to the Space Album)

Any failure: Marcos explains what happened → Retry task | Restart mission | Back to the map
```

**The weight trade-off.** The spacecraft weighs 20 kg and the rocket can only lift 60 kg. Each mission offers three pieces of equipment (15, 20 and 25 kg), and each one helps with exactly one task. You can take at most two. Taking the 20 kg and the 25 kg items together makes 65 kg, and the launch is aborted: that mistake is part of the lesson. Travelling light pays off too, with a lightness bonus of 2 seconds for every 10 kg left free.

**Scoring.** Each task has its own timer.

`Final time = max(0, T1 + T2 + T3 − lightness bonus)`

| Final time | Stars |
|---|---|
| up to 45 s | ⭐⭐⭐ |
| 46 to 70 s | ⭐⭐ |
| 71 to 100 s | ⭐ |
| over 100 s | none: "took too long" |

A star bar on screen shows how many stars are still within reach and shakes when you lose one.

### Phase 1 · Project Mercury (Friendship 7)

| Equipment | Weight | Helps with | Effect |
|---|---|---|---|
| 🧭 Gyroscope | 15 kg | Task 1 | Locks each target in 1.2 s instead of 2.0 s, and the crosshair snaps to the target |
| 📘 Flight Manual | 20 kg | Task 2 | Highlights the code on the clipboard and adds 15 s |
| 🛡️ Reinforced Shield | 25 kg | Task 3 | Hold the retropack for 6 s instead of 10 s, with less shake |

| Task | What you do | How you fail |
|---|---|---|
| **1 · The Autopilot Failure** | Put the **+** crosshair on 4 red markers outside the capsule and hold until each circle fills | Passing 40 s |
| **2 · The Communication Blackout** | Read a random 4-digit code on the navigation clipboard, then type it into the radio. A red EJECT CAPSULE button blinks next to the keypad | Pressing EJECT, or running out of time (30 s, or 45 s with the manual) |
| **3 · The Heat Shield Alarm** | Decide within 10 s: EJECT CAPSULE or HOLD RETROPACK. Then hold the green button while reentry plasma fills the windows. Letting go only pauses | Pressing EJECT, or not deciding in time |

### Phase 2 · International Space Station

Locked until you earn at least one star on Mercury.

| Equipment | Weight | Helps with | Effect |
|---|---|---|---|
| ⏲️ Pressure Sensor | 15 kg | Task 1 | Green zone of the pressure control 50% bigger |
| 🧤 Grip Gloves | 20 kg | Task 2 | Drag the loose cables 2× faster without slipping |
| 🧰 Sealing Kit | 25 kg | Task 3 | Air loss 40% lower and sealing in 2.0 s instead of 3.0 s |

| Task | What you do | How you fail |
|---|---|---|
| **1 · The Docking (STS-88, 1998)** | At the robotic arm console, drag 4 spheres onto 4 ✕ marks while keeping the arm pressure in the green zone with a valve. The pressure lags and drifts, so you keep adjusting. When you finish, Zarya slides in and locks onto Unity outside | Pressure at maximum for 3 s in a row, or passing 40 s |
| **2 · The Stuck Solar Panel (STS-97, 2000)** | A spacewalk. Drag 2 loose cables to their green pulleys. Move too fast and the cable slips back to where it started | Passing 45 s |
| **3 · The 2 mm Leak (Soyuz MS-09, 2018)** | Cabin air drops 2.5% per second. Close the hatch (halves the loss), find the hole among 4 wall panels by spotting air being sucked in, take the epoxy gauze and hold it on the hole | Cabin pressure reaching 0% |

After Phase 2, **Next phase** takes you to the full game on Roblox.

### Marcos Pontes, your guide

Marcos Pontes, the first Brazilian astronaut, appears as a blocky character who welcomes you and explains every failure: what went wrong, the parallel with the real event, and a tip tied to the equipment you did or did not bring. **His lines are fictional and written for the game**; the game says so in the credits.

### Controls

| | Desktop | Mobile |
|---|---|---|
| Move | WASD or arrow keys | On-screen joystick |
| Jump | Space | Jump button |
| Interact | E, or click | Tap the prompt |
| Look around | Drag the mouse | Drag with one finger |
| Zoom, down to first person | Mouse wheel | Pinch with two fingers |
| Mission panels | Mouse and keyboard | Touch; panels become a compact strip at the bottom |

Interface text cannot be selected or copied, so stray drags never interrupt play. Progress is saved in the browser.

### Shortcuts for presenting

Add these after `index.html` to jump straight to a moment (`g=m` is the female character, `g=h` the male one):

| Link | Opens |
|---|---|
| `#lang=en&g=m&jogar&tp=museu` | The museum (also `recepcao`, `totem`, `hangar`, `elevador`, `braco`). Add `&pp` to start in first person |
| `#lang=en&g=m&jogar&expo=atlantis` | An exhibit card |
| `#lang=en&g=m&jogar&preparo` | The Mission Flight Manifest (`preparo=falha` picks an overweight load) |
| `#lang=en&g=m&jogar&missao=2&abrir` | A task directly (`1`, `2` or `3`) |
| `#lang=en&g=m&jogar&missao=fim&t=41` | The learning screen and the result for a 41 s run (`t=120` shows the "took too long" failure) |
| add `&m=2` | The same shortcut for Phase 2 (ISS) |
| `#lang=en&g=m&jogar&album` | The Space Album |

### Tuning the game

Every number lives in [`dados.js`](dados.js): `regrasPeso` (weights and bonus), `equipamentos` (items and effects), `missao1` and `missao2` (countdown, task limits and star thresholds). Every text lives in the same file under `idiomas.en` and `idiomas.pt`. Nothing is hard-coded in the game logic.

---

## Part 2 · The Roblox project

The folder [`rookie-rocket-roblox/`](rookie-rocket-roblox/) is the source of the full game, a Roblox place called **NASA Space Adventure**. It was developed in its own repository ([tulioamaral123/roockie-rocket](https://github.com/tulioamaral123/roockie-rocket)) and brought here with its complete commit history, so the submission keeps the demo and the game together.

### What the full game adds

- **A much larger map** inspired by the Kennedy Space Center: reception, museum and planetarium, the Launch Control Center, the Vehicle Assembly Building with the SLS on its Mobile Launcher and crawler, the crawlerway and Launch Pad 39B.
- **Co-op for 1 to 4 players.** One astronaut reads the clipboard while another types on the radio; one aligns the spheres while another watches the pressure.
- **Walkable spacecraft:** a Mercury capsule with three stations and an ISS module with a Cupola, an Airlock and a real floating spacewalk.
- **Two guides,** Marcos Pontes and Ana, cutscenes for arrival and liftoff, a crew suit-up room, and navigation arrows on the floor.
- **An interactive museum,** including a Saturn V you can explore part by part.

### How it is built

The place is not edited by hand. It is **generated by code**:

| Piece | Where | How it reaches Roblox Studio |
|---|---|---|
| The map (parts, lights, signs) | `build/phase1_structure.luau` … `build/phase24_outdoor.luau` | Generator scripts, run in order by `build/run_in_studio.luau` |
| Mission scripts | `build/rookie/{server,client,shared}` | [Rojo](https://rojo.space/), live |
| Museum scripts | `build/museum/` | Rojo |
| Guides and navigation | `build/guide/` | Rojo |
| Doors, crew access, planets | `build/systems/` | Rojo |

Each generator phase tags the parts it creates and clears them before rebuilding, so any phase can be re-run safely.

### Where to look

| File | What it tells you |
|---|---|
| [`docs/rookie-rocket-spec.md`](rookie-rocket-roblox/docs/rookie-rocket-spec.md) | The full mission design: Mercury and ISS, co-op, weight, stars, the Album |
| [`build/rookie/shared/Missoes.luau`](rookie-rocket-roblox/build/rookie/shared/Missoes.luau) | **The single source of truth** for mission numbers and texts |
| [`docs/rookie-contrato.md`](rookie-rocket-roblox/docs/rookie-contrato.md) | The contract between map parts and scripts |
| [`docs/marcos-pontes-spec.md`](rookie-rocket-roblox/docs/marcos-pontes-spec.md), [`docs/guias-spec.md`](rookie-rocket-roblox/docs/guias-spec.md) | The guides |
| [`museuspec.md`](rookie-rocket-roblox/museuspec.md), [`docs/museu-foguete-interativo.md`](rookie-rocket-roblox/docs/museu-foguete-interativo.md) | The museum and the explorable Saturn V |
| [`spec-v3.md`](rookie-rocket-roblox/spec-v3.md) | How the map is laid out and built |
| [`ROJO.md`](rookie-rocket-roblox/ROJO.md) | Setting up Rojo, VS Code and Roblox Studio |
| [`IMPLEMENTATION.md`](rookie-rocket-roblox/IMPLEMENTATION.md) | The state of every build step |

The documents inside that folder are written in Portuguese, the team's working language. All text shown to players in the Roblox game is in English.

### How the demo and the game stay in sync

The web demo reads its mission design from the same place the Roblox scripts do. Weights, time limits, star thresholds, equipment effects, the learning texts and the real mission cards in the demo match `Missoes.luau`: identical in English, translated in Portuguese.

What the demo leaves out, because it is single-player and runs in a browser:

| In the Roblox game | In the web demo |
|---|---|
| Co-op for up to 4 players | One player; Marcos speaks to you alone |
| Walking between stations inside the spacecraft | Stations are panels, and the camera turns to each one |
| Floating with thrusters on the spacewalk | Dragging the cables on a board, with the same speed rule |
| Ana, the suit-up room and the liftoff cutscene | The manifest opens at the hatch and liftoff is seen from inside the cabin |
| Pressure drift of 0.32 in the docking task | 0.25, because one player handles both the spheres and the pressure |

---

## Data and sources

The project rule is strict: **only data released for the challenge or served by official NASA APIs.**

- **Exhibit photos and facts** come from the **NASA Image and Video Library** (`images-api.nasa.gov`). Every card shows the record ID, the date, the credit and a link.
- **The Friendship 7 card** uses NASA record `9248362` and the official report on the NASA Technical Reports Server, [NTRS 20040110111](https://ntrs.nasa.gov/citations/20040110111).
- **The ISS card** uses NASA record `iss020e005813` (the P4, P5 and P6 trusses) and three NASA pages: [STS-88](https://www.nasa.gov/mission/sts-88/), [STS-97](https://www.nasa.gov/mission/sts-97/) and the [ISS status report of August 30, 2018](https://www.nasa.gov/blogs/spacestation/2018/08/30/international-space-station-status-3/).

| Exhibit or card | NASA records |
|---|---|
| Marcos Pontes | iss012e22280, 20060409_exp12_11 |
| Visitor Complex entrance | KSC-03pd2164 |
| Rocket Garden | KSC-03pd2174 |
| Sigma 7 | KSC-20161107-PH_GEB02_0276 |
| Mercury Mission Control | KSC-20161107-PH_GEB02_0090 |
| Hall of Fame | KSC-20161107-PH_GEB02_0118 |
| Atlantis | KSC-2012-6136, KSC-2012-6362, 2013-2311 |
| Saturn V | KSC-98pc1004 |
| Artemis I (inspiration for the rocket) | NHQ202211160030, MAF_20221211_Splashdown02 |
| Phase 1 card · Friendship 7 | 9248362 |
| Phase 2 card · Building the ISS | iss020e005813 |

### What is real and what is not

- **Real:** the missions, dates, crews, events and photos named above.
- **Simplified for play:** all weights, times, speeds and equipment effects are teaching values, not historical data. The game states this in its credits.
- **Fictional:** every line spoken by the Marcos Pontes character.
- **Original:** the scenery, the characters, the suits and the RR-01 rocket are our own block-style creations. The museum gathers in one hall attractions that sit in different buildings at the real Visitor Complex; it is a representation, not an architectural replica.
- This is not an official product of NASA or of the Kennedy Space Center Visitor Complex.

---

## Team and contributions

**Anna Clara Diniz · Hurias Felipe Silveira · Luis Renato Fernandes · Nando Nogueira · Túlio Amaral · Valter Cauã Alves**

The table below records what this repository's commit history shows. Work done outside the repository, such as game design, research, playtesting, building in Roblox Studio and preparing the pitch, does not appear in a commit log and is shared by the whole team.

| Contributor | In this repository |
|---|---|
| **Anna Clara Diniz** | Built the **web demo** at the root: the 3D world, both missions, the bilingual interface and the mobile layout. Published every tagged version from `v1` on, and merged the Roblox project into this repository with its history intact |
| **Túlio Amaral** | Authored the **Roblox project**: the map generator phases (1 to 24), the Mercury and ISS mission scripts, the museum, the guides, the cutscenes and the specs. The folder `rookie-rocket-roblox/` comes from his repository |
| **Valter Cauã Alves** | Set up the **collaboration workflow** of the Roblox project: the agent guidelines, the task board, parallel worktrees and the integration test |
| **Hurias Felipe Silveira** | Team member and repository collaborator |
| **Luis Renato Fernandes** | Team member |
| **Nando Nogueira** | Team member |

### How to contribute

1. Clone the repository and create a branch for your change.
2. **Web demo:** edit the files at the root and open `index.html` to test. Change numbers and texts in `dados.js`, always in both languages. Bump the `?v=` number in `index.html` so browsers load the new files.
3. **Roblox project:** follow [`rookie-rocket-roblox/ROJO.md`](rookie-rocket-roblox/ROJO.md). Change a generator and rebuild instead of editing parts by hand, and keep new scripts as files under `build/`.
4. When a mission rule changes, update **both** `Missoes.luau` and `dados.js`, so the demo and the game keep matching.
5. Open a pull request describing what changed and how you tested it.

### Use of AI tools

AI coding assistants were used during development. The web demo was built with Claude Code, and the Roblox project used Claude Code and Codex, as documented in `rookie-rocket-roblox/CLAUDE.md` and `rookie-rocket-roblox/AGENTS.md`. The team chose the design, checked the facts against NASA sources and tested the results.

---

## Version history of the web demo

| Tag | What changed |
|---|---|
| `v1` – `v2` | First 3D world: reception, museum, hangar; language choice and the storyboard look |
| `v3` – `v6` | Start screen, Phase 1 prototype in first person, star rating, the Space Album |
| `v7` | Equipment chosen by weight, with Marcos explaining every failure |
| `v8` – `v10` | Mobile mission panel, first-person zoom, the Roblox kiosk, the star bar |
| `v11` – `v12` | **Phase 1 complete:** the full Mercury mission with its 3 tasks, aligned with the Roblox game's data |
| `v13` | **Phase 2 complete:** the ISS mission with its 3 tasks and the Building the ISS card |

---

## Credits and licenses

- 3D engine: [three.js](https://threejs.org/) r128, MIT license.
- Fonts: Outfit and Michroma, SIL Open Font License. License files are in `lib/`.
- Photos: NASA, via the NASA Image and Video Library.
- Made for the **NASA Space Apps Challenge 2026 · Space Mission Design Game**.

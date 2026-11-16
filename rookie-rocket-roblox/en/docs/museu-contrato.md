> English translation of [`docs/museu-contrato.md`](../../docs/museu-contrato.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Museum hall: contract between the tasks

Updated on November 14, 2026. The spec is `museuspec.md` (a copy of "Space Museum on Roblox"). This file records the decisions that change it and the coordinates and names the three tasks share. **Where this file and the spec disagree, this file wins.**

## User decisions (November 14, 2026)

| Topic | Spec | Decided |
|---|---|---|
| Scale | 0.28 m/stud | **0.7 m/stud** (the map's is ~0.85; a bit larger to impress). `Escala.metros(m) = m / 0.7` |
| Language | pt-BR | **English** in everything that appears in the game (like the rest of the map). Code comments in Portuguese |
| Current planetarium | — | Stays as the **entrance atrium (island 0)**; the new hall grows east from it |
| Font | Gotham | `FontFace` Montserrat (Gotham was removed) |
| Construction | Team Create + Rojo `src/` | Geometry by **generators** in `build/` (Phases 16 and 17, the CLAUDE.md rule); game systems by **Rojo** in `build/museum/` |

## Coordinates (studs; Y = 0 is the top of the floor; X is width, Z points to the map's north)

Planetarium (already exists): X 44..136, Z −13..68, center (90, 27.5). Its east face (X ≈ 130..136) is the wall Phase 14 closed; Phase 16 opens the passage to the hall there, centered at Z 27.5.

**Hall:** X 136..400, Z −45..100, floor Y 0, ceiling **Y 50** (exposed metal structure). Walls outside these limits.
**Glass atrium (rocket garden):** X 200..330, Z 100..150, open to the hall along the whole Z 100 face, glass roof at **Y 72**.

| Island | Area (X, Z) | Content |
|---|---|---|
| 0 Entrance | planetarium + X 136..172, Z 5..50 | passage, counter, totem with map, `MuseumArrival`, `MuseumExit` |
| Spine | axis Z 27.5, X 176..334 | Saturn V lying down and suspended, **F-1 engines facing west** (the first thing seen on entering) |
| 1 Pioneers | X 140..200, Z 58..100 | Mercury (capsule, suit, Space Race and Mercury Seven panels) |
| 2 Rocket garden | atrium | Mercury-Redstone and Mercury-Atlas standing (demo) |
| 3 Apollo | under the Saturn V, X 180..330, Z 5..50 | Apollo CM in a showcase, Apollo 11 timeline, diorama + show console |
| 4 Atlantis + Hubble | X 336..400, Z 30..100 | Atlantis tilted 43.21°, doors open, arm extended; Hubble beside it |
| 5 Memorial | X 345..400, Z −45..−5 | sunken niche (floor Y −3, steps), low warm light |
| 6 Mars | X 275..340, Z −45..−5 | rover |
| 7 Modern | X 205..275, Z −45..−5 | Orion/SLS, Webb, ISS |
| 8 Mission wall | X 140..205, Z −45..−5, wall Z −45 | 8 card showcases |

Free corridors of at least 9 studs (6 m). No dead ends.

## Real measurements → studs (0.7 m/stud)

Source: `museuspec.md` §16.1. Modeling approximations (not shown on signs) are marked with *.

| Piece | Real | Studs |
|---|---|---|
| Saturn V total | 110.6 m | 158 |
| S-IC | 42.1 × 10.1 m | 60.1 × 14.4 |
| F-1 (height × nozzle exit) | 5.8 × 3.8 m | 8.3 × 5.4 |
| S-II* | ~24.9 × 10.1 m | ~35.6 × 14.4 |
| S-IVB | 18 × 6.7 m | 25.7 × 9.6 |
| Instrument unit | 0.9 × 6.4 m | 1.3 × 9.1 |
| Remainder (adapter, LM, SM, CM, escape tower)* | ~23.8 m | ~34 |
| Orbiter | 37.2 × 23.8 × 17.4 m | 53 × 34 × 25 |
| Mercury-Redstone* | ~25 m | ~36 |
| Mercury-Atlas* | ~29 m | ~41 |

Saturn V: engine base at X 176, tip of the escape tower at X 334; axis at Y 22 (bottom of the S-IC at Y ~14.8). Stages slightly separated (2–3 studs), as in the real hall.

## Hierarchy and names (what the systems read)

- `Workspace.NASAComplex.SpaceMuseumHall` (Phase 16): architecture, lights, atrium, niche, audio zones, arrival point, exit portal, Mission wall (structure + showcases).
- `Workspace.NASAComplex.SpaceMuseumExhibits` (Phase 17): displayed vehicles and objects, diorama and show console.

**Exhibit** (any examinable object):
- `Model` with the `Exhibit` tag (CollectionService) and the `ExhibitId` attribute (string, equal to the `Id` in the content file). `PrimaryPart` set.
- Components: an `Attachment` named after the component's `Id` (e.g. `s_ic`, `f1_1`), inside any part of the model.
- A `PromptAnchor` part (invisible, non-colliding) where the prompt should appear; if missing, the `PrimaryPart` is used.
- Demo IDs: `saturn_v`, `mercury_capsule`, `mercury_suit`, `space_race`, `mercury_seven`, `apollo_cm`, `apollo11_timeline`, `atlantis`, `hubble`, `memorial_apollo1`, `memorial_challenger`, `memorial_columbia`, `mercury_redstone`, `mercury_atlas`, `mars_rover`, `orion_sls`.

**Saturn V** (`ExhibitId = saturn_v`; "Explore rocket" uses these names and the spacecraft part prefixes, see `docs/museu-foguete-interativo.md`): sub-Models `Stage_S_IC`, `Stage_S_II`, `Stage_S_IVB`, `Stage_IU`, `Stage_Spacecraft`, each with a `StageIndex` attribute (1..5) and a `ShowLight` part with a `SpotLight` turned off (`Enabled = false`) that lights the stage. Attachments: `s_ic`, `s_ii`, `s_ivb`, `iu`, `spacecraft`, `les`, `f1_1`..`f1_5`, `j2_ii_1`..`j2_ii_5`, `j2_ivb`. The 5 F-1s use the same geometry.

**Atlantis** (`atlantis`): sub-Models `PayloadDoor_L` and `PayloadDoor_R` with a `HingeOffset` attribute (CFrame of the hinge relative to the door's pivot) and `OpenAngle` (degrees); the system animates them. Attachments: `main_engines`, `tiles`, `wings`, `tail`, `cockpit`, `canadarm`.

**Launch show** (Phase 17, island 3):
- `LaunchDiorama` (Model): `MiniRocket` (Model, Saturn V at 1:20 of the big one), `Exhaust` parts with a `ParticleEmitter` turned off, `Pad`.
- `LaunchConsole` (Model): parts with the `ConsoleLight` tag and an `Order` attribute (1..N), `Screen` (Part with its face toward the audience; the system creates the `SurfaceGui`), a `ShowPromptAnchor` part.

**Mission wall** (Phase 16): `MissionWall` with `CardSlot_1`..`CardSlot_8`, each a Model with `Glass`, `Plinth`, `ModelAnchor` (where the scale model goes), `PhotoFrame` (Part; the system places the photo) and a `PointLight` turned off in `SlotLight`.

**Others:** `MuseumArrival` (SpawnLocation, `Neutral = false`, `Enabled = true`); `MuseumExit` (Part with the `MuseumExit` tag and an `ExitDirection` attribute = Vector3 of the direction of someone leaving; the client checks position, it does not use Touched); audio zones = invisible Parts with the `AudioZone` tag and an `Ambience` attribute (`hall`, `atrium`, `memorial`); island signs with the `IslandSign` tag.

## Budgets

- Phase 16: up to ~2500 parts, up to 40 lights, shadows on only 3 of them. Do not touch `Lighting` (global): local lights only.
- Phase 17: up to ~3000 parts; Saturn V and Atlantis with `ModelStreamingMode = Persistent`, the rest `Atomic`. `CollisionFidelity`/`CanCollide = false` on parts out of reach.
- Nothing may close the walking path (check with `Humanoid:MoveTo` or raycasts).

## Who does what

| Task | Who | Files (only these) |
|---|---|---|
| A. Hall (Phase 16) | Codex | `build/phase16_museum_hall.luau` |
| B. Exhibits (Phase 17) | Codex | `build/phase17_museum_exhibits.luau` |
| C. Systems + content | Claude | `build/museum/**`, `default.project.json`, `build/run_in_studio.luau`, docs |

Nobody changes `lib.luau` or other phases, or saves the place. Play only through Claude.

---

## Revision 2 (November 14, 2026, evening): new layout, rounded corners, real photos

User request (drawing): the museum moves from the east of the planetarium to **the south of the planetarium, vertical (length along Z), east of the LCC**, linked to the LCC by **two corridors** on the museum's west side. The passage to the planetarium stays (user decision). All shapes with **rounded corners and forms**. Walls aligned along the whole base. Real NASA photos on the panels.

### Museum transformation

The generators keep writing in the coordinates of the table above ("design coordinates") and, at the end, apply a single rigid transformation to their whole model:

```lua
-- same in Phases 16 and 17
local MUSEUM_CF = CFrame.new(205, 0, 85) * CFrame.Angles(0, -math.pi / 2, 0) * CFrame.new(-136, 0, -27.5)
-- design (x, z) -> world (205 - (z - 27.5), 85 + (x - 136)); design +X becomes world +Z
```

Result in the world: **hall X 132.5..277.5, Z 85..349**; **atrium X 82.5..132.5, Z 149..279** (to the west, facing the LCC); north entrance (F-1s head-on) at (205, 85); memorial on the east side; Saturn V along Z at X 205. Areas checked as free in Studio. Constraints: the VAB reaches X 72 for Z ≥ 209; LaunchComplex starts at Z 320 with X ≤ 128.

Transformation rules:
- Apply with `model:PivotTo(MUSEUM_CF * model:GetPivot())` at the end (or transform each CFrame); attributes holding world vectors/CFrames (`ExitDirection`, `ClosedPivot`, `EnginePlane`…) must also be transformed (`MUSEUM_CF.Rotation` for directions).
- The Baseplate split (the memorial pit) uses the **already transformed** rectangle (it stays axis-aligned, because the rotation is 90°).
- Show camera: Phase 17 creates in `LaunchConsole` an invisible `ShowCamera` part (CFrame = camera position looking at the target; design: position (300, 7, −16), target (303, 13, 22)) that is transformed along with the rest. The client uses that part; the script holds only the field of view.

### Connections (Phase 16)
- **Planetarium → museum:** open the planetarium's south face (Z ≈ 68) and create an entrance gallery in the Z 68..85 strip leading to the hall's north entrance, centered on the X 205 axis (the F-1s head-on as you enter). Undo the planetarium's old east opening (the one from revision 1).
- **LCC → museum (2 corridors, 12 × 12, straight, along X):** A at Z ≈ 157 (X 6 → 82.5, enters the atrium) and B at Z ≈ 119 (X 6 → 132.5, enters the hall). Open the LCC's east wall (find the walls by geometry, not by name: Phase 12 may change) without cutting screens, consoles or the `LCC_Links` connections. Same finish as the existing corridors (glass strips, floor, light).
- A `MuseumExit` at each of the 3 entrances, with `ExitDirection` pointing out of the museum (in the world).

### Rounded style (all phases)
- Outer and inner wall corners: a vertical `Cylinder` column (diameter = wall thickness) at the junction, same color/material.
- Pillars and columns: cylinders. Counters, benches and pedestals: a rectangle + half-cylinders at the ends, or corners made with cylinders (see `B.cyl`). Showcases with cylindrical uprights.
- Portals and openings: a chamfered lintel (WedgePart) or a segmented arch; cylindrical jambs.
- No CSG on large parts (bad collision; see the Baseplate case). Budget: at most +15% parts per phase.

### Misaligned walls (Studio sweep, November 14)
T-joints with a gap: `LCC_Links.C1_Wall`/`C2_Wall` → `LCC Interior_Lining` (1.0); `LCC Interior_Lining` → `West_Wall` (0.1, two of them); LCC side screens → walls (0.4–0.5); `CapeCanaveralMuseum Mars_Exhibition.Backdrop_S/W` → walls (0.5). Misaligned wall line: `Corridor_02 Hangar_Portal_L/R` × `VAB Front_Wall_L/R` (faces 2.0 apart). Doors and gates recessed on purpose do not count.

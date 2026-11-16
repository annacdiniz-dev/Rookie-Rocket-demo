> English translation of [`docs/rookie-contrato.md`](../../docs/rookie-contrato.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Rookie Rocket contract: parts (generators) × scripts

Spec: `docs/rookie-rocket-spec.md`. This file states **the name, the position and the role** of every part the scripts use. Generator and script talk only through these names: do not rename anything without updating it here and on both sides.

User decisions (November 15, 2026):
- The seated mission from Phase 15 is gone. Phase 19 deletes its parts (`BuildPhase = 15`) and the old script folders (`ReplicatedStorage.MissionSystem`, `ServerScriptService.MissionSystem`, `StarterPlayerScripts.MissionClient`).
- All visible texts in **English** (the spec's lines are translated in `Missoes.luau`).
- Entry through Ana on the access arm: a single panel chooses the mission, puts on the CrewAccess suit and chooses the equipment. The kiosk in the LCC points the way to Ana.
- The server requires `SuitOn == true` and `Character.SpaceSuit`, and validates stage/proximity to Ana, the ISS unlock, the mission's items, a maximum of two items and 60 kg **before** teleporting. The button stays clickable at 65/80 kg so the overweight can be explained while still on the pad.
- The first boarding fixes the shared manifest and starts a 12 s countdown; up to four crew members board with the same manifest before the last second. There is no item selection inside the ship. `Retry task` keeps the items; `Restart mission` returns the team to the boarding position and reopens the selector; a normal exit returns to the LCC.
- `RookieMission` (id on the Player, server only) keeps the suit on during the mission/EVA. Outside a mission, CrewAccess removes the suit when leaving the VAB/launcher/arm (moving reference) or the enlarged Orion cabin. A respawn without `SpaceSuit` clears `SuitOn`.
- Local gravity: `CapsuleBounds` enables a VectorForce on the character with an effective gravity of 35 studs/s² and a jump impulse of 19 studs/s. Original properties are restored outside the capsule, on EVA, on exit or on character change; Workspace.Gravity does not change.
- The NavigationClient arrow has a local mission mode: it watches targets → clipboard → radio → retropack; on the ISS it goes through the capsule/Cupola/Airlock accesses and follows console, cables/pulleys, hatch, tools and hole.

## Ownership

| Owner | Files |
|---|---|
| Codex (`codex/rookie-mercury`) | `build/phase19_rookie_mercury.luau` (Mercury capsule + kiosk in the LCC + Phase 15 cleanup) |
| Codex (`codex/rookie-iss`) | `build/phase20_rookie_iss.luau` (ISS module, Cupola, Airlock, exterior) |
| Claude (`claude/rookie-rocket`) | `build/rookie/**`, `build/phase21_rookie_systems.luau`, `default.project.json`, `build/run_in_studio.luau`, this file |

The generators **do not create** ProximityPrompts, dynamic-text SurfaceGuis, sounds or scripts: only parts with the names below. The scripts create the rest.

## Rules common to the generators

- `lib.builder(N)` and `B.clear(Map)` like the other phases; root `Workspace.NASAComplex.RookieRocket` (Folder; create it if missing, never delete the whole folder, because the two phases share the root).
- Each ship is a `Model` with `PrimaryPart = Origin` (an invisible 1×1×1 part, `CanCollide/CanQuery/CanTouch = false`) and `ModelStreamingMode = Persistent` (clients need the parts even far from the map).
- Everything `Anchored`. Marker-only parts: `Transparency = 1`, `CanCollide = false`, `CanQuery = false`, `CanTouch = false`.
- Absolute coordinates (the ships do not move): **Mercury with `Origin` at (−3000, 1200, 0)**, **ISS with `Origin` at (3000, 1200, 0)**. The top of the inner floor sits at the Y of `Origin`. Ship axis along Z.
- Interior for 1 to 4 R15 players walking freely: passages at least 6 wide and 8 high; ceiling height ≥ 12; no step > 1.
- Closed interior (the player cannot fall out). Windows: `Material = Glass`, `Transparency` 0.3 to 0.5, `CanCollide = true`.
- Interior lighting: lights (`PointLight`/`SpotLight`) inside parts whose name starts with `CabinLight`, all in a `Lights` folder. A pleasant base brightness against the night sky (clients swap the sky for stars during the mission).
- Fonts through `FontFace` (Montserrat). Fixed texts (signs) in English.
- Visual quality at the level of the rest of the map (panels, cables, rivets, detailed consoles), without overdoing the parts: aim for up to ~1,500 parts per ship.

## Mercury (`NASAComplex.RookieRocket.Mercury`, Phase 19)

A 16-sided conical capsule inspired by the Orion from Phase 8: Ø32 at the floor, Ø24 at the ceiling, 15 high. Three stations spread around the perimeter: front panel/periscope, navigation, and the radio/retropack set. No mandatory seats; the four players move around the center.

| Path | Type | Role |
|---|---|---|
| `Origin` | Part | PrimaryPart, at (−3000, 1200, 0) |
| `Spawns/Spawn1..4` | marker Part | where the team appears on boarding (near `PrepConsole`), facing +Z |
| `Bounds` | marker Part | 32 × 15 × 32 box centered at Origin + (0, 7.5, 0); validates the walkable interior |
| `CapsuleBounds` | marker Part | same volume; enables the capsule's local gravity |
| `Stations/PrepConsole` | visible Part (console) | confirmed manifest; prompt disabled, no second preparation |
| `Stations/Exit` | visible Part (hatch) | leave the ship and return to the LCC |
| `Windows/*` | Glass Parts | five glass panels of ~6.36 × 7.24: Window3/4/5 at the front (+Z), Window8 on the left and Window0 on the right; real openings in the conical hull |
| `Exterior/AlignPoints/Point1..4` | red Neon Ball Part, diameter 4 | Task 1: targets outside the ship, 40 to 70 studs from the windows. Point1 and Point2 visible through the front window; Point3 through the left side; Point4 through the right side. Each one visible from a floor spot where a standing player can aim (clear line between eye height, floor + 5, and the point). `CanCollide = false`, `CanQuery = false` |
| `Exterior/PlasmaEmitters/Emitter1..N` (N ≥ 4) | marker Part with a `ParticleEmitter` (`Enabled = false`, orange/red, bright) | Task 3: reentry plasma passing the windows (the client turns it on) |
| `Stations/NavTable` | Model | Station 2 (side window + navigation table) |
| `Stations/NavTable/Clipboard` | Part (clipboard ~2.5 × 0.1 × 3.5, lying flat, `Top` face up) | Task 2: SurfaceGui on the Top face and prompt "Read flight code"; a server-validated read shows the code and moves the arrow to the radio |
| `Stations/Radio` | Model | Station 3a: radio console |
| `Stations/Radio/Keypad` | visible Part | Task 2: radio keypad (prompt "Use radio") |
| `Stations/Radio/EjectButton` | visible red Part (Neon) | Task 2: "EJECT CAPSULE" button blinking next to the keypad |
| `Stations/Reentry` | Model | Station 3b: retropack console, far enough from the NavTable to require walking (≥ 20 studs) |
| `Stations/Reentry/EjectButton` | red Part | Task 3: "EJECT CAPSULE" |
| `Stations/Reentry/RetainButtonA`, `RetainButtonB` | green Parts, 6 to 10 studs apart | Task 3: "HOLD RETROPACK" (redundant, for co-op); 7 studs apart |
| `Seats/Seat_1..4/Seat` | Seat (CanTouch = false), attribute `SeatNumber` | 4 crew seats (2 × 2, facing +Z); GerenciadorMissao creates the "Take seat" prompt |
| `Lights/CabinLight*` | Parts with a light | the client pulses them red (Task 1) and orange (Task 3) |

Buttons and keypads sit 3–4 above the floor, facing where the player stands.

### Return point in the LCC (also Phase 19)

The "Mission Briefing" panel (cabinet, `Screen`, pedestals `BoardMercury`/`BoardISS` and the "Mission briefing" prompts) was removed after the November 15, 2026 playtest (`docs/rookie-melhorias-playtest.md` §6): the mission is chosen only with Ana at the top of the rocket. What remains is `NASAComplex.RookieRocket.Kiosk` (Model) with a single part:

| Path | Role |
|---|---|
| `Kiosk/ReturnPoint` | marker Part in the LCC lobby: where the team returns after leaving the ship; base of the guides' `PainelPrincipal` point |

### Cleanup of the old mission (start of Phase 19)

`lib.builder(15)` + `B.clear(Map)` to delete the Phase 15 parts, and `Destroy()` on `ReplicatedStorage.MissionSystem`, `ServerScriptService.MissionSystem` and `StarterPlayer.StarterPlayerScripts.MissionClient`, if they exist.

## ISS (`NASAComplex.RookieRocket.ISS`, Phase 20)

A 16-sided arrival capsule (Ø32/24, H15), local center (−42, 0, −12), linked by a tunnel to the habitable module. During the 12 s of arrival the collar animates the docking; the cabin stays fixed to preserve the crew's physics. The hatch opens when Task 1 starts, and the three tasks follow in the module/EVA.

Habitable module linked to the **Cupola** (7 windows: 1 central circular/octagonal + 6 trapezoidal ones facing Earth), an **Airlock** and an **adjacent module** separated by a hatch. A large, sunlit Earth below the station.

| Path | Type | Role |
|---|---|---|
| `Origin` | Part | PrimaryPart, at (3000, 1200, 0) |
| `Spawns/Spawn1..4`, `Bounds` | as in Mercury | spawns on the capsule floor, local X −48/−44/−40/−36, Z −12; Bounds center (−9, 6, −2), size 98 × 24 × 110 covers capsule + interiors |
| `CapsuleBounds` | marker Part | center (−42, 7.5, −12), size 32 × 15 × 32; local gravity |
| `Capsule/DockingHatch` | visible Part | hatch at (−25, 6, −12), size 0.6 × 12 × 20; closed during arrival, invisible/non-colliding during the tasks |
| `Capsule/DockingCollar` | visible Part, CFrame attribute `DockedPose` | collar animated during docking, independent of the cabin |
| `Capsule/Tunnel*` | Parts | closed tunnel up to the opening in the habitat's west wall; passage level with the floor |
| `Stations/PrepConsole`, `Stations/Exit` | as in Mercury | |
| `Cupola/Windows/*` | Glass Parts | the 7 windows |
| `Stations/CanadarmConsole` | visible Part (console with 2 joysticks), inside or next to the Cupola | Task 1: prompt "Use Canadarm console" |
| `Exterior/Unity` | Model | Unity module, visible through the Cupola windows |
| `Exterior/Zarya` | Model with a `PrimaryPart` | Zarya module **misaligned** at build time (≈ 12° of rotation and ≈ 6 studs away from the fitting) |
| `Exterior/ZaryaDockedPose` | marker Part | final CFrame of Zarya's pivot when docked (the script animates from `Zarya:GetPivot()` to here) |
| `Exterior/SolarPanels`, `Exterior/Canadarm` | decorative Models | visible solar arrays and robotic arm |
| `Exterior/Earth` | large Ball Part (up to 2048), `CanCollide/CanQuery/CanTouch = false` | sunlit Earth below the station (blue, with clouds; optional texture/decal) |
| `Airlock/InnerHatch` | visible Part (inner hatch) | Task 2: prompt "Start EVA" |
| `Airlock/EvaStart` | marker Part, outside the station | where the player appears when going out on EVA |
| `Airlock/EvaReturn` | marker Part, inside | where the player returns at the end of the EVA |
| `Exterior/EvaBounds` | marker Part (box) | safety tether area: the player on EVA does not leave it |
| `Exterior/Cables/Cable1`, `Cable2` | Part (cable ~0.6 × 0.6 × 6) | Task 2: loose cables, inside `EvaBounds`, `CanCollide = false` |
| `Exterior/Pulleys/Pulley1`, `Pulley2` | Part (green circle, Neon) | pulleys; each 20–35 studs from its cable, inside `EvaBounds` |
| `Exterior/TetherAnchor` | marker Part next to the Airlock | the point the visual safety tether comes from |
| `Stations/AdjacentHatch/Door` | visible Part (hatch door), open at build time | Task 3: the script moves `Door` to `Stations/AdjacentHatch/DoorClosedPose` |
| `Stations/AdjacentHatch/DoorClosedPose` | marker Part | CFrame of the closed door |
| `Stations/AdjacentHatch/Prompt` | marker Part next to the hatch | anchor of the "Close hatch" prompt |
| `Stations/Toolbox` | visible Part (toolbox) | Task 3: prompt "Take epoxy gauze" |
| `LeakSpots/Spot1..4` | marker Part on the walls, at different spots in the module, with a `ParticleEmitter` (`Enabled = false`, fine light particles going **into** the wall) | Task 3: the server picks one hole at random |
| `Lights/CabinLight*` | Parts with a light | the client turns on the emergency red |

The exterior (EVA) must be navigable while floating: no parts that trap the player, cables and pulleys reachable from `EvaStart`.

## Scripts (`build/rookie/`)

Rojo (`default.project.json`):
- `ReplicatedStorage.RookieRocket` (`RojoManaged`): `Config/Missoes` (all constants and texts), `Remotes` (`SelecionarEquipamento`, `IniciarLancamento`, `AcaoTask`, `ReiniciarTaskOuMissao`, `SincronizarEstado`).
- `ServerScriptService.RookieRocket`: `GerenciadorMissao.server` + task modules + `DataStoreManager`.
- `StarterPlayerScripts.RookieClient`: navigation/EVA/effects, preparation UI, HUD/feedback/album/credits.

Without Rojo, Phase 21 installs the same scripts through the HTTP server (like Phase 18).

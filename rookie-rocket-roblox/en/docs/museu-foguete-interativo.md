> English translation of [`docs/museu-foguete-interativo.md`](../../docs/museu-foguete-interativo.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Rookie Rocket — Interactive view of the museum's central rocket

## Goal

When the museum's central rocket is selected, present a distant side view that frames the whole rocket and lets the player select its components. For each component, show a panel with clear information and verified real photographs.

## Before implementing

Read `CLAUDE.md`, `AGENTS.md`, `TASKS.md`, the specs and the museum contracts. Inspect the current map and scripts to identify the central rocket, its model, scale, orientation, parts and existing interaction. Do not assume it is a Saturn V, an SLS or another rocket: confirm before researching or creating content. Preserve the existing systems and respect file reservations, the phase flow and Rojo. Texts visible in the game must be in English.

## Player experience

1. The player reaches the central rocket and triggers the existing interaction, or a clear prompt such as `Explore Rocket` if there is none yet.
2. The camera moves smoothly back and to the side of the rocket, showing its full length, from top to base.
3. The player sees discreet markers on the available parts and can select a component by click, touch or gamepad.
4. On selecting a part, a panel shows its name, function, brief context and the matching real photograph.
5. The player can choose another part, close the panel or leave the view.
6. On leaving, the camera and the controls return to their previous state; the player's progress is preserved.

## Camera

- Compute the framing from the model's real bounds, orientation, field of view and screen ratio. Leave a margin at the top and base and keep the whole rocket visible on narrow screens too.
- Choose a side point with good visibility. Check for obstacles with a raycast or another suitable strategy; adjust the point so it does not go through walls or show a wall in the foreground.
- Make the transition smooth and short. Avoid sudden moves, flickering and repeated camera changes.
- During exploration mode, keep the character safe and avoid conflicts with other cameras, dialogues and controls. The behavior must be individual for each player.
- Save and restore the original camera and control settings on close, on respawn, on leaving the experience or if the interface is destroyed. Avoid trapping the player in controlled-camera mode.
- An option to end must stay visible and reachable; `Close`/`Back` must work on keyboard, touch and gamepad.

## Component selection

- Inspect the real rocket generated in the project and define clickable regions matching the parts the model actually represents. Possible examples, only when applicable to the identified rocket: capsule or spacecraft, escape tower, stages, tanks, engines, thrusters and fins.
- Use selection areas large and discreet enough for touch, without changing the rocket's look or blocking normal navigation. Avoid ambiguous overlap between regions.
- Show a subtle highlight and a name on hover or selection. Include a list of selectable components as an accessible alternative when direct clicking is hard, especially on mobile or with a gamepad.
- Switching components updates the same panel, without duplicating interfaces, connections or effects. The selection must match the component actually chosen.
- Do not create fictional names, divisions or functions to fill gaps in the model; if a component cannot be identified, document the limitation.

## Information panel and photos

For each confirmed component, present:

- A name in English and its main function in accessible language.
- One or two brief, verified real facts related to the correct rocket.
- A relevant real photo of the component, or an image identified as an overview when no suitable specific photograph exists.
- Credit and source reference; an explicit note when the image is an illustration or reconstruction instead of a photograph.
- A loading state and a readable fallback when the asset fails to load, without preventing closing or choosing other parts.

Research data and images in official and primary sources, prioritizing NASA and the organizations responsible for the mission. Check the identification, context, rights and terms of use of each image; record the URL of the source page, credit, license or relevant terms and the Roblox ID actually used. Do not invent links, licenses, IDs or historical data. External URLs do not replace an image asset the Roblox client can access; only present an asset as working after verifying it. Do not use generic images of another rocket as if they were of the real component.

## Integration and safety

- Reuse the exhibit system and the existing interfaces whenever suitable; keep component data separate from presentation.
- Interacting with the exhibit must keep counting toward the tutorial rule that requires learning about at least one item. Leaving the view must not erase progress.
- Interface and camera are local to the player. Validate on the server any event that changes progress, without relying only on data sent by the client.
- Avoid collisions with the existing arrow, dialogue, mission and camera systems. Do not change other players' cameras.
- Use assets allowed by the project's rules. If some content or permission is unavailable, report the limitation and keep the panel working with a substitute.

## Acceptance criteria

- On activating the correct central rocket, the camera zooms out to the side and frames the whole model without going through walls at the resolutions tested.
- Identified components are selectable by mouse, touch and gamepad; each selection shows the matching content.
- The panels have readable text, verified real photos, credits and sources; a missing image does not break the flow.
- On closing, the camera and the controls return to normal; respawn, exit and repeating the interaction also work.
- The visit counts toward museum progress, and other players keep their own camera and progress.
- Test on PC, on mobile and with two players when the environment allows; record errors and tests not performed.
- Document the files changed, sources and assets, checks run, phases to run in Studio and a playtest script. Update the project records according to its instructions.

---

## Implementation (November 15, 2026)

**Central rocket:** Saturn V (`NASAComplex.SpaceMuseumExhibits.SaturnV`, `ExhibitId = saturn_v`, Phase 17), lying down and suspended along the hall's Z axis (engines at Z ≈ 125, escape tower at Z ≈ 283, X 205, Y 22). Existing interaction: "Examine" prompt → museum panel → **Explore rocket** button (replaces the old "View components" on the Saturn V).

**Files**
- `build/museum/client/RocketExplorer.luau` (new): framing, regions, selection, exit/restore.
- `build/museum/client/PanelController.luau`: button, exploration panel (list + detail + photo), layout on the right, Backspace = back, the same exhibit's prompt does not close the panel during exploration; photo loading by periodic check.
- `build/museum/shared/Content/Exhibits/SaturnV.luau`: `Explore` (11 parts with `Region`, `Function`, `Facts`, `Photo`, `Overview`), `ExploreBack`, new sources.
- `build/museum/shared/Content/Photos.luau`: 9903033 marked as an illustration (cutaway); caption of 9903401 fixed (Apollo 6 heading to pad 39A).
- `build/museum/shared/Text.luau`: `explore.*` texts.
- `build/rookie/client/Modais.luau`: the same fix to the "Photo loading…" notice (IsLoaded).

**Camera:** side candidates (angles from 32° to 130° relative to the engine side, elevation 6–24°, both sides, current FOV/80/90) with the minimum distance that fits in the free area to the left of the panel (6% margin); the first with a clear line of sight (no solid part or glass between the camera and five points on the axis, and nothing within 2 studs of the camera). If none fits, it reduces the panel margin (60% and 0). Transition of 0.9 s (0.4 s when reframing), on the render step. Movement locked (ContextActionService), prompts and touch controls turned off only for the player; everything restored on going back, closing, respawning, dying or changing camera. If another controlled camera is active (the museum show), it does not enter.

**Parts (11):** F-1 engines, S-IC, J-2 (S-II), S-II, S-IVB, J-2 (S-IVB), Instrument unit, Lunar module adapter, Service module, Command module, Launch escape system. The divisions come from the model's real parts (sub-Models `F1_*`, `J2_*`, `J2`, `Stage_IU`; prefixes `SpacecraftLMAdapter`, `ServiceModule`/`SMRadiator`, `CommandModule`/`DockingCover`, `Escape`/`Abort`). The lunar module sits inside the adapter and is not modeled separately.

**Photos (all checked in Studio and on the client in Play; NASA, images.nasa.gov, free to use under NASA's media guidelines, no endorsement):**

| Part | NASA ID | Type | Roblox asset |
|---|---|---|---|
| F-1 engines | 6862832 | photo | rbxassetid://104882711537786 |
| S-IC | 9903033 | illustration (cutaway) | rbxassetid://116647837362210 |
| J-2 (S-II) and S-II | 9903176 (S-II arriving at MSFC, 5 J-2s visible) | photo | rbxassetid://135981874714718 |
| S-IVB | 0100983 | illustration (cutaway) | rbxassetid://115359478469854 |
| J-2 (S-IVB) | 6520309 | photo | rbxassetid://100257590637995 |
| Instrument unit | 0100984 | illustration | rbxassetid://94397447288064 |
| Lunar module adapter | 0100985 (Apollo spacecraft cutaway, LM inside the adapter) | illustration | rbxassetid://109197135716456 |
| Service module | 7010516 (Apollo 13's damaged SM) | photo | rbxassetid://109612002889429 |
| Command module | 372772main_GPN-2000-001212_full | photo | rbxassetid://77017815760691 |
| Launch escape system | 6900547 (Apollo 11's tower) | photo | rbxassetid://104974056535973 |

The 7 new ones were uploaded on November 15, 2026 (downloaded from images-assets.nasa.gov, served on localhost and uploaded with Studio's `upload_image`; owner: the game's account). as13-59-8500 was replaced by 7010516 (same official description, module up close). The "Overview photo" notice remains in the code, unused today.

**Facts:** official metadata from images.nasa.gov (6862832, 9903033, 0100979, 9801770, 9801810, 0600309, 6757813, 0100983, 0100984, 0100985, 6974206, as13-59-8500) and the Apollo 8 press kit (ntrs.nasa.gov, escape tower).

**Verified in Play (PC, 1507 × 786):** opening the panel from the prompt; Explore rocket; the camera frames the whole rocket in the free area (X 45–910 px, Y 284–522 px), with no wall between camera and rocket; hovering highlights and shows the name; clicking the F-1s selects them and shows the loaded photo, facts and sources; choosing from the list (S-II) updates highlight and panel; Back to exhibit restores the camera (Custom, Humanoid, FOV 70), prompts and markers; re-entering; respawning during exploration restores everything. Framing computed (without rendering) for 16:9, 4:3, landscape phone 844 × 390 and 4:3 tablet: it fits in all of them.

**Not tested:** touch and gamepad on a real device (B and the list with the d-pad), two players, screenshot (Studio's `screen_capture` times out). No phase needs rebuilding (scripts only).

**Playtest script:** museum → Saturn V → E (Examine) → Explore rocket → click/tap 3 parts → choose 2 from the list → Back to exhibit → Explore again → close with X; on mobile, check that the whole rocket appears to the left of the panel; with a gamepad, navigate the list and leave with B.

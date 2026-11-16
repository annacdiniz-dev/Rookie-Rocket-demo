> English translation of [`docs/paisagismo-spec.md`](../../docs/paisagismo-spec.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Rookie Rocket — Landscaping and outdoor setting

## 1. Goal

Complement the complex's existing landscaping with visitor access, a parking lot, gardens, a lake and soft clouds, preserving circulation, visibility and the operation of the Florida-inspired space center.

The proposal is visual: do not implement vehicle driving, transport, new missions or simulation systems as part of this task.

## Current state verified on November 15, 2026

- In the checkout `/Users/tulioamaral/Documents/nasa`, branch `claude/rookie-rocket` (commit `ab6e01c`), Phase 1 applies green `Grass` material to the outer baseplates and their splits.
- Phase 23, `build/phase23_landscape.luau`, already creates `NASAComplex.Landscape.Trees`: sabal palms and oaks with a fixed seed, space tests and exclusions for the launch area, pad visibility and the reception axis. The runner already includes Phase 23.
- A query to the open Studio, place ID `116695605898974`, found 39 palms, 31 oaks, a baseplate with `Grass` and no `Clouds` object in `Terrain`. This confirms the presence of those elements, not their visual quality nor the latest published state.
- `IMPLEMENTATION.md` records the application of grass and trees and says the look still needed checking. The Phase 11 parking area is **the crawler's**, not the visitor parking requested here.
- Tasks 5, 6 and 7 still listed `build/run_in_studio.luau` as reserved at verification time; check `TASKS.md` again before modifying any shared file. Other tasks are awaiting a test in Studio.
- This review did not confirm the presence or absence of a lake or visitor parking across the whole place; inspect the locations and generators before creating those elements.

## 2. Before starting

1. Read `CLAUDE.md`, `AGENTS.md`, `TASKS.md`, `spec-v3.md` and the relevant parts of the map specs. Check the tasks in progress and the file reservations before editing.
2. Inspect the current map in Studio and in the code. Confirm the location of the reception, the planetarium, museum, control center, VAB, pad, entrances, paths, navigation points and terrain limits. The references below are approximations from an earlier inspection and may change.
3. Preserve the phase generation flow and the idempotency rules. If you create a landscaping phase, register it and integrate it into the rebuild process only when the necessary files are available for this task. Do not hand-edit the place as the definitive source.
4. `build/run_in_studio.luau` and other shared files have appeared as reserved by other tasks. Check the updated `TASKS.md` and follow the project rule if there is still a conflict.
5. The previous rebuild reported a failure in the phase 16 circulation validation, related to a pedestal. Check the current state and report separately any failure that predates your change.
6. Use visible texts in English. For external 3D models, follow the project rule: Roblox Creator Store only, recording ID and license in `assets/LICENSES.md`. Prefer the project's own simple geometry when appropriate.

## 3. Visual direction

- A contemporary space center, with landscaping inspired by the Florida coast: lawns, sparse palms, trees of varied size and low shrubs.
- Organize the landscape into visitor areas near the entrance and more natural vegetation at the edges of the complex.
- Use natural colors and balanced lighting; the rocket, the VAB and the museum must remain the focal points.
- Vary the scale and rotation of a few light models to avoid obvious repetition. Do not place vegetation inside buildings or covering doors, windows and signs.
- The scenery must look integrated with the existing ground level, with no floating parts, z-fighting or unexpected steps.

## 4. Entrance, access and parking

Create an arrival area in front of the reception, after confirming where the entrance used by the player is.

- An access road visually connected to the parking lot and the complex, with a surface and edges clearly distinct from the lawn.
- A parking lot proportional to the map's scale, with marked spaces and a few accessible spaces near the entrance path.
- A continuous pedestrian path from the parking lot to the door, with a crosswalk where it crosses the road. Keep free space for circulation and access.
- Add low planters, benches and spaced lighting. Signs, if any, must be in English.
- Decorative vehicles are optional; if added, they must not block accessible spaces, paths or accesses. The area does not require drivable vehicles.
- Validate that the spawn, the tutorial arrow and the existing doors are not covered or trapped.

## 5. Reception and museum gardens

- Make use of the existing lawn and trees; add planters and occasional vegetation around the reception and the planetarium, respecting their foundations, entrances and paths.
- Distribute small groups of trees and palms, with shrubs and low plants to compose the scene.
- Keep a clear strip next to the player's doors, windows, signs and routes. Do not cover exhibits or screens visible from inside.
- Use moderate variations in plant size and spacing. The composition must remain readable from the point of view of someone entering the game.

## 6. Lake and natural area

- First evaluate a free area west of the complex for an irregular lake; confirm in Studio the position, the terrain, the routes and the limits before fixing coordinates.
- Build a visually natural shore, with low vegetation and a few trees set back from the water. Add a small overlook or observation path linked to the visitor area, if there is safe space.
- Choose a water solution compatible with the terrain and the existing systems. If it is only decorative, avoid implying that swimming or crossing is implemented.
- Avoid expensive transparent surfaces, intersections with the baseplate and edges where the player could get stuck or fall off the map.
- Do not occupy the pedestrian route to the pad, safety areas or spaces needed for future phases.

## 7. Surroundings of the VAB and the pad

- Make use of the existing grass and vegetation; complement only where needed, without changing how the infrastructure works.
- Keep gates, the pedestrian exit, the crawlerway, the pad, the observation area and the access routes completely clear.
- Position trees so they do not intercept the transport assembly along its whole route, including the crawler's retreat and sideways move.
- Preserve the view of the SLS from the front gate and the view of the pad from the observation area. Avoid tall trees near lines of sight and moving elements.
- Do not add new physical obstacles inside safety zones or navigation routes.

## 8. Sky and clouds

- Add light, spaced clouds, preferably using the native atmosphere and cloud features already compatible with the project.
- Check the existing lighting before changing cover, density, color or atmosphere. Preserve the buildings' contrast and do not darken the scene too much.
- Check the result from the entrance, the VAB and the pad, including when looking at the rocket. Avoid clouds continuously hiding important points.

## 9. Technical organization

- Make use of the existing Phase 23. Decide, according to the current reservations, whether the extension belongs to Phase 23 itself or to a complementary phase; do not duplicate the existing trees. Every phase must follow the project's `BuildPhase` pattern and idempotent cleanup.
- Ensure that re-running the phase does not duplicate trees, roads, lighting or cloud settings. Do not delete elements from other phases. Phase 23 places trees at random before a possible later phase: reserve the future parking, lake and path areas in the distribution logic, or define another safe order; validate a clean rebuild and an independent re-run without overlaps.
- Use clear names for groups, such as `EntranceLandscape`, `Parking`, `MuseumGardens`, `Lake` and `OuterVegetation`, adapting them to the existing conventions.
- Preserve the paths, navigation points and properties of other phases. Record any dependencies or shared changes needed.
- Use moderate amounts of parts and lighting; group elements when it makes sense and avoid per-plant effects and scripts. Consider streaming and performance on modest devices.

## 10. Suggested order

1. Inspect the map and delimit the allowed and forbidden areas.
2. Build entrance, access and parking; validate circulation.
3. Add gardens near the reception and the museum.
4. Define the lake's position and build shores and overlook, reconciling the occupied areas with Phase 23.
5. Complete the distant vegetation, respecting the VAB, crawlerway and pad.
6. Adjust clouds and lighting; review the scene from different viewpoints.
7. Run the project's validations and a full circulation playtest.

## 11. Acceptance criteria

- The entrance has readable pedestrian access and parking; the player reaches the reception without obstacles.
- Gardens and trees do not cover entrances, windows, signs, exhibits or essential indicators.
- Lake and overlook sit in a free area, without conflict with routes, limits or operational zones.
- The VAB gate and the crawler's whole route stay unobstructed; the view of the SLS and the pad stays clear.
- Re-running the new phase neither duplicates nor removes content from other phases.
- Clouds and lighting leave the scenery readable and keep the rocket visible.
- Validate the dimensional rules, the route sweep and the route playtest described in `CLAUDE.md`. Run `stylua --check build` and `selene build` if they are installed.
- Record in the result the files and assets used, their licenses where applicable, the phases to run in Studio, the tests performed, pre-existing failures and limitations. Update `IMPLEMENTATION.md` and `TASKS.md` according to the project's rules.

---

## Implementation (November 15, 2026)

**Map checked in Studio:** reception entrance facing −Z (canopy at (0, 11, −4)); spawn inside the reception at (0, 0, 12); planetarium X 44..136, Z −12..68, door at (60, 11, −9); front (Z < 0) and west (X < −100) with grass only; daytime lighting (ClockTime 13, Atmosphere and Sky from Phase 5), no clouds. There was no lake and no visitor parking. The old Phase 16 failure (pedestal in the planetarium) does not recur in the current place.

**Phase 23 (changed):** reserves the Phase 24 areas (road, parking, plaza and sidewalks, lake, lake path, planetarium gardens) and creates the `Landscape` folder without `BuildPhase` (cleaning one phase does not delete the other). Re-run: 70 trees, none over Phase 24.

**Phase 24 (new, `build/phase24_outdoor.luau`):**
- `EntranceLandscape`: road X −500..500, Z −121..−99 (asphalt, white lines and a dashed yellow line), plaza X −24..24, Z −44..−6, sidewalk to the road, crosswalk at X −5..5, drop-off on the other side with benches and a VISITOR DROP-OFF sign, a VISITOR ENTRANCE sign, 4 planters, 2 benches and 8 light poles (PointLight without shadow).
- `Parking`: parking lot X −160..−40, Z −97..−28 with 24 marked spaces in 2 rows, entrance from the road, 2 accessible spaces (blue) next to the sidewalk that leads to the plaza, VISITOR PARKING and ACCESSIBLE PARKING signs, 3 poles and 6 decorative cars outside the accessible spaces.
- `MuseumGardens`: 3 planters and shrubs south of the planetarium, door at X ≈ 60 left clear.
- `Lake`: lake at (−232, 15) made of 5 opaque discs (no transparency), sand on the shore, rocks and reeds; an invisible 14-high barrier on the shore and 12-high colliders on the overlook (you cannot enter the water, not even by jumping); a wooden overlook with railing, bench and a LAKE OVERLOOK sign, linked to the parking lot by a path.
- `OuterVegetation`: 40 shrub clumps on the free grass, outside the reserved zones.
- Native clouds (`Terrain.Clouds`): Cover 0.5, Density 0.3, white; lighting kept.
- About 580 parts and 14 lights; no external model and no new asset.

**Validations (Studio, Edit):** no Phase 24 part touches a part from another phase (apart from grass and landscaping); no tree over Phase 24; pathfinding from the parking lot and the drop-off to the reception door: ok (inside, the automatic door opens in the game); from the parking lot to the tip of the overlook: ok; to the middle of the lake, from 4 sides, with and without jumping: no path. The launch complex, the crawler route and the view from the observation area lie outside all the areas used (reserved zones).

**Not verified:** appearance (Studio screenshot unavailable), mobile, a full route playtest and a new run of the crawler sweep (nothing was placed near it). `stylua`/`selene` not installed.

**To rebuild:** Phase 23 and then Phase 24 (the runner already includes both, in that order).

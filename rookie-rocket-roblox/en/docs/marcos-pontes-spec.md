> English translation of [`docs/marcos-pontes-spec.md`](../../docs/marcos-pontes-spec.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Rookie Rocket — Specification of the Marcos Pontes NPC

## 1. Goal

Create in Roblox Studio a guide NPC inspired by the Brazilian astronaut **Marcos Cesar Pontes**, portrayed at a more mature stage of his life. The character welcomes the player on entering the complex and walks them to the museum entrance. His appearance should convey experience, friendliness and credibility, while keeping Roblox's accessible, stylized visual language.

This is a fictional representation for educational purposes: the NPC's lines and actions are created for the game and must not suggest participation, authorization or endorsement by Marcos Pontes, NASA or any institution. Avoid a cloned voice and lines attributed to him as real quotes.

## 2. Visual and historical references

Use these references **before modeling**. Compare mainly the recent portrait with the astronaut clothing, because images from the 2006 mission show a younger stage:

1. [Senate profile and official portrait](https://www.congressonacional.leg.br/web/senadores/senador/-/perfil/6009) — reference for mature appearance, face and hair. The profile gives his date of birth as March 11, 1963.
2. [Photograph from a 2024 event](https://www.panrotas.com.br/destinos/parques-tematicos/2024/09/agentes-e-criancas-conhecem-o-astronauta-marcos-pontes-em-sao-paulo-fotos_209307.html) — a more recent contextual reference, for expression and posture. Credit given on the page: PANROTAS / Emerson Souza.
3. [Official press page and photo album](https://marcospontes.com/imprensa/) — check the high-resolution photos and their individual credits.
4. [Kennedy Space Center — biography](https://www.kennedyspacecenter.com/person/marcos-pontes/) — biographical context.
5. [NASA — Expedition 13 press kit](https://www.nasa.gov/wp-content/uploads/2023/06/expedition13-presskit.pdf) — historical reference for the blue suit and the patches; the portrait is from 2006, not his mature appearance.

The photographic sources are references for the artist; this does not automatically grant a license to copy, publish, upload images to Roblox or use trademarks. Before reusing any photo or logo as an asset, check the applicable rights, authorization and credits. Prefer creating original art for the uniform and fictional emblems for the game.

**Note for Claude:** the pages were identified as references; fine facial features were not confirmed by visual inspection in this specification. Open the images and confirm the details before modeling. Do not invent scars, deep wrinkles, exact eye color, baldness or personal measurements.

## 3. Art direction

- The appearance of a mature Brazilian man, roughly in his 60s, without exaggerating signs of aging.
- A face recognizable from the recent portrait: observe overall proportion, hairline, hairstyle, eyebrows, nose, smile and jaw shape in the photograph before drawing.
- Skin tone and hair color must be adjusted by comparing directly with recent photos under neutral lighting. Do not assume white or gray hair only because of age.
- A stylized 3D look, compatible with Roblox R15 characters. Do not use a photorealistic texture pasted on the face; seek likeness through simple shapes, hair, expression and uniform.
- A welcoming, calm expression, with a discreet smile and natural eyebrows. He should be friendly without looking childish or like a caricature.
- A body proportional to the game's avatar standard, with an adult silhouette and an upright, relaxed posture. Do not invent height or build as biographical data.
- Avoid glasses, a beard, a mustache, accessories or permanent details that are not clearly present in the chosen photo. If photos differ, choose one specific recent reference and stay consistent.

## 4. Visual construction of the character

### 4.1 Head and face

1. Use an R15-compatible head, with a rounded shape and stylized human proportion.
2. Adjust the width and length of the face by visual comparison with the recent reference, without exaggerated deformation.
3. Create eyebrows that are readable at a normal interaction distance; discreet lines, without an angry look.
4. Eyes proportional to the game's style, facing forward; set a color only if the reference shows it clearly.
5. Simplified nose and mouth; use a light, natural smile.
6. Expression lines must be subtle, if they are needed to represent maturity. Do not turn age into caricature.
7. Do not depend on micro details that disappear on mobile. Check the face both up close and several studs away.

### 4.2 Hair

- Look at the recent photo to determine color, volume, parting and front line.
- Create a low-volume hair piece or accessory that fits the outline of the head, without going through the forehead or ears.
- Model it with a few blocks or a simple mesh, avoiding thin strands and unnecessary transparency.
- If gray is visible in the photo, represent it with a subtle color variation, not a noisy texture.

### 4.3 Uniform

Create an original reinterpretation of a blue flight suit, inspired by the historical NASA portrait, combined with the mature appearance from the recent photos. This is an artistic choice: do not present this combination as a photograph of a specific mission.

- A one-piece blue coverall, medium to dark in tone, with a discreet collar.
- A thin central zipper in a lighter color; it does not need to work mechanically.
- Simple seams on shoulders, sides and knees; small pockets suggested by relief or drawing.
- A readable name tag on the chest with `M. PONTES` or `MARCOS PONTES`.
- A fictional Rookie Rocket emblem and, if desired, a suitable representation of the Brazilian flag. Respect the rules that apply to symbols and assets.
- A discreet belt and closed boots in very dark blue or black.
- No helmet covering the face during the welcome; the player needs to recognize the character and read his expression.
- Do not copy institutional patches or logos without checking the terms of use; do not imply an official partnership.

### 4.4 Materials and legibility

- Main colors: the coverall's blue, a darker variation for boots and details, a discreet light color for the zipper and name tag. Adjust the tones to the map's lighting.
- Matte or low-gloss materials; avoid neon, chrome metal and excessive reflections.
- Prioritize silhouette, face, hair and uniform before decorative details.
- Make sure arms and legs move without going through the torso or accessories.

## 5. Role in the experience

1. The player appears in the complex's reception.
2. Marcos is near the spawn, visible and reachable, without blocking circulation.
3. An individual arrow points to him; the objective in English is `Meet Marcos Pontes.`
4. The player approaches and triggers a `ProximityPrompt`.
5. The NPC starts a short welcome conversation, presents the complex and invites the player to visit the museum.
6. After the dialogue, the arrow points to the museum and Marcos walks with the player on the initial stretch.
7. At the museum entrance, he says goodbye and stops following. The player explores on their own.
8. The later progression — choosing at least one museum item, going on to the rocket and meeting Ana — belongs to the overall journey; do not make Marcos accompany the player in those stages.

## 6. Personality, speech and animation

**Fictional personality:** an experienced, patient, positive and curious guide. He speaks clearly and directly, without promising results, faking historical testimony or reproducing real phrases without a source. The game's texts must be in English.

Sample dialogue, created for the game:

1. `Welcome to Rookie Rocket! I'm Marcos Pontes, and I'll help you get started.`
2. `Before your mission, let's visit the museum and explore the history of spaceflight.`
3. `Follow me. There's plenty to discover along the way!`
4. On arrival: `Here we are! Take a look around and choose an exhibit to learn more. Good luck, explorer!`

These lines are fictional. Avoid recordings that imitate the real voice without authorization; text in the interface is enough.

**Animations:**

- Idle: gentle breathing, balanced posture and a discreet head movement.
- Welcome: a small wave, once, without sudden movements.
- Dialogue: look toward the player with moderate gestures, without forcing the user's camera to turn.
- Walk: a natural pace, with arms and legs in sync; stop on reaching the museum entrance.
- Farewell: a short gesture and a return to idle.
- Avoid waving loops, instant rotations and gestures that occupy passages.

## 7. Roblox requirements for implementation

- Use an R15 model with `Humanoid`, `HumanoidRootPart`, `Animator` and correctly connected parts.
- Use a `ProximityPrompt` with text in English, for example `Talk` / `Marcos Pontes`; present name and dialogue in an interface accessible on PC, mobile and gamepad.
- Store lines in a configuration module; separate content, interface, navigation and progress control.
- Use `PathfindingService` and `Humanoid:MoveTo()` for movement; recompute if the path fails or is blocked. Do not teleport the player to fix the NPC.
- Set a minimum following distance and a speed consistent with walking. The NPC must not push or trap players.
- Progress validated on the server; the client presents dialogue and arrow. Do not trust an event sent by the client as proof that a stage was completed.
- Plan for multiple players: each has their own objective and dialogue. Define explicitly how individual instances of the guide are isolated or synchronized; a shared NPC must not let one player's progress change another's.
- Avoid duplicated event connections, repeated prompts, loops that never end and excessive pathfinding use.
- Reuse the project's existing patterns. Before changing code, read `CLAUDE.md`, the current specs and the reserved tasks. Follow the phase-based generator and the Rojo rules; do not edit the place by hand as the definitive source.
- External 3D models only from the Roblox Creator Store, with ID and license recorded in `assets/LICENSES.md`, according to the project's rules. Do not assume an asset is authorized without checking its license.

## 8. Acceptance criteria

- The player identifies the NPC near the spawn and can interact by keyboard, touch and gamepad.
- Face, hair and apparent age were compared with at least one recent photograph; the look does not depend on the young 2006 portrait.
- Original blue uniform, readable name tag and visible face; consistent appearance at different distances and on mobile.
- The dialogue appears in English, advances correctly and is not presented as a real quote.
- Marcos walks to the museum, goes around obstacles, says goodbye and stops following at the right place.
- Each player keeps their own progress, even if another starts a conversation or leaves during the route.
- The behavior is tested with one and with two players, including a blocked path, reconnection and a respawning character.
- Studio's Output shows no errors; animations do not go through the body and the NPC does not block doors.
- Record the assets and licenses actually used, and state in the PR the phases to run and the playtest performed.

## 9. Expected delivery to Claude

Before implementing, check the visual references and the project's real structure. Deliver the character and the scripts according to the repository's existing rules, document decisions and limitations, and state which phases must be run in Studio. When a visual feature cannot be confirmed in the photos, choose a neutral representation and record that it is an artistic interpretation.

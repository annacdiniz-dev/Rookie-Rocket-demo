> English translation of [`docs/guias-spec.md`](../../docs/guias-spec.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Rookie Rocket — Roblox Spec: Guide NPCs and the Complex Tour

## 1. Overview of the experience

The player begins the journey as a new astronaut intern inside the Rookie Rocket space complex.

On entering the game, the player appears in the starting area and meets astronaut Marcos Pontes. After a welcome conversation, Marcos introduces the experience and leads the player to the main museum. On arrival, Marcos says goodbye and lets the player explore. To move on, the player must select and learn about at least one exhibit item.

Next, an arrow shows the way to the rocket entrance. The route may go through the hangar and the control room. On approaching the entrance, the player hears a siren and is called by Ana, who guides them to the top of the rocket. There, on the first experience, they must choose the first available mission and select the trip's trade-off. With the choices made, the rocket launches and the mission begins.

The experience starts with Marcos Pontes, a guide NPC, who welcomes the player and presents the complex.

The player explores the museum and continues through the complex to the rocket.

Navigation is guided by a red 3D arrow that points to the next destination.

## 2. Characters

### 2.1 Marcos Pontes — guide NPC

- R15 character.
- Astronaut uniform or blue institutional suit.
- Stays near the Spawn.
- Has a ProximityPrompt interaction.
- Presents the complex and walks the player to the first museum.
- On reaching the museum, he says goodbye and lets the player explore alone.
- He does not go with the player to the hangar or the control room.

### 2.2 Ana — operations engineer NPC

- Female R15 character.
- White and blue space engineer uniform.
- Starts out of the player's sight.
- When the player approaches the rocket entrance, a siren sounds and Ana calls for their attention.
- She enters the scene to welcome the player.
- She guides the player to the top of the rocket and to the mission selection.

The dialogues are fictional. Marcos Pontes is represented as a fictional character, without suggesting official participation or endorsement.

## 3. Map and points of interest

### 3.1 Reception / Spawn

- The player's starting place.
- Marcos stands near the spawn point.
- A setting with the visual identity of a space center.
- The red arrow points to Marcos.

### 3.2 First museum

- A space exhibition area.
- Information panels and historical objects.
- Marcos walks the player to the entrance.
- On arrival, Marcos says goodbye.
- After the player interacts with at least one item, the arrow shows the way to the rocket.

### 3.3 Rocket hangar

- A large space with rockets and equipment.
- The player explores it alone.
- Large windows show the outside.
- If it is part of the route, the hangar offers navigation points toward the rocket entrance.

### 3.4 Control room

- Monitoring panels.
- Screens with mission information.
- Consoles and workstations.
- A side door into the complex.
- A main panel for mission information.

## 4. Presentation sequence

1. **Spawn:** the arrow points to Marcos; the player interacts with him and is welcomed.
2. **Way to the museum:** Marcos walks with the player and says goodbye on arrival.
3. **Museum:** the player explores and selects at least one item. Progress is validated before the next destination is shown.
4. **Rocket:** the arrow guides the player to the entrance, along a route that may include the hangar and the control room. On approach, a siren sounds and Ana calls the player.
5. **Preparation:** Ana guides the player to the top of the rocket. On the first experience, the first mission is mandatory; then the player chooses the trade-off.
6. **Launch:** with the choices complete, the rocket departs and the mission begins.

## 5. Dialogue system in Roblox

Create a ScreenGui interface with:

- The character's name.
- The dialogue text.
- The NPC's avatar or portrait.
- A button to continue.
- A text reveal animation.
- An option to skip ahead through the dialogue.

Dialogues must be stored in ModuleScripts so they are easy to change.

## 6. Navigation system with a red arrow

### 6.1 Arrow behavior

Create a red 3D arrow visible to the player.

Characteristics:

- Red color.
- Stands out visually.
- Gentle floating animation.
- Points toward the next destination.
- Updates automatically with progress.
- Must not go through walls.
- Must work individually for each player.

### 6.2 Destination sequence

1. Spawn → Marcos.
2. Marcos → Museum.
3. Museum → Exhibit item, until one is selected.
4. Museum → Rocket entrance, with waypoints through the complex.
5. Rocket entrance → Ana → Top of the rocket and mission selection.

### 6.3 Roblox implementation

Create:

- `NavigationPoints`: a folder with the destination points.
- `NavigationService`: the service responsible for progress and destinations.
- `NavigationUpdate`: a RemoteEvent to update the player's destination.
- A visual indicator on the client to render the arrow.

The arrow must be updated according to progress events.

Use waypoints to guide navigation, so the arrow never indicates a path through walls.

### 6.4 Objective interface

Show a short message on the HUD with the current objective.

Examples of objectives visible in the game (in English):

- "Meet Marcos Pontes."
- "Explore the museum and select an exhibit."
- "Go to the rocket entrance."
- "Follow Ana to the top of the rocket."
- "Choose your mission and trade-off."

## 7. NPC movement

Use:

- Humanoid.
- Animator.
- PathfindingService.
- Humanoid:MoveTo().
- Walking and idle animations.

Marcos walks with the player only on the initial stretch to the museum.

Ana enters the scene near the rocket entrance and guides the player to the top.

NPCs must avoid obstacles and must not block the player's way.

## 8. Cooperation and multiple players

- Players can explore the complex together.
- Each player has their own navigation progress.
- The arrow must be individual.
- Shared dialogues must avoid duplicated events.
- One player's arrival must not improperly change another's objective.
- The server controls each player's progress.

## 9. Suggested technical structure

```text
Workspace
├── NPCs
│   ├── MarcosPontes
│   └── Ana
├── NavigationPoints
│   ├── Spawn_Marcos
│   ├── PrimeiroMuseu
│   ├── Hangar
│   ├── SalaControle
│   ├── Ana
│   └── PainelPrincipal
└── Map

ReplicatedStorage
├── Remotes
│   ├── NavigationUpdate
│   └── DialogueEvent
└── Config
    └── Dialogues

ServerScriptService
├── NPCService
├── NavigationService
└── ProgressService

StarterGui
└── DialogueGui

StarterPlayer
└── StarterPlayerScripts
    └── NavigationClient
```

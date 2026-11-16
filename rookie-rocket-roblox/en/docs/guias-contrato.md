> English translation of [`docs/guias-contrato.md`](../../docs/guias-contrato.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Guides contract (Marcos Pontes and Ana): parts × scripts

Spec: `docs/guias-spec.md`. Generator: `build/phase22_guides.luau`. Scripts: `build/guide/` (Rojo).

## Hierarchy

```text
Workspace.NASAComplex.Guides            (Phase 22)
├── NPCs                                 Marcos ("MarcosPontes") and Ana, assembled by NPCService in Play
└── NavigationPoints                     invisible 1×1×1 parts at HumanoidRootPart height (floor + 3)
    ├── Spawn_Marcos                     next to the SpawnLocation, facing it
    ├── PrimeiroMuseu                    planetarium entrance (museum 1): start of the guided visit
    ├── Tour1..5                         Marcos's stops in front of each museum 1 exhibit (facing it)
    ├── Museum1End                       planetarium south door (end of museum 1): Marcos's farewell
    ├── AnaMeet / AnaStartLCC            in front of the LCC control room / inside it: siren, Ana comes out and calls the player
    ├── PainelPrincipal                  ReturnPoint of the Mission Briefing kiosk in the LCC
    ├── SalaControle                     X = 0 axis of the LCC
    ├── Hangar                           right after the VAB front gate
    ├── RocketEntrance                   in front of the crew suit-up room (siren + Ana)
    ├── Ana                              back of the suit-up room: where she enters the scene
    └── Ana_Route1..5                    suit-up room → +X door → foot of the launcher stairs

ReplicatedStorage.GuideSystem
├── Config  (build/guide/shared)         Dialogues (lines, objectives, appearance), Settings
└── Remotes (created by GuideBoot)       NavigationUpdate, DialogueEvent, MissionSelect
ServerScriptService.GuideSystem          GuideBoot, ProgressService, NavigationService, NPCService, World, MarcosLook
StarterPlayerScripts.GuideClient         GuideClient, NavigationClient, DialogueGui, MissionSelect, GuideUI
ServerStorage.RookieBridge               created by GerenciadorMissao: Embarcar(player, id, items), Perfil, EmMissao
ServerStorage.CrewSuit                   CrewAccess BindableFunction: Invoke(player, true) puts on the suit
ServerStorage.GuideParking               Ana stays here while off stage
```

Points read live from the `TransportSystem` (they follow the launcher; they are not created by Phase 22):
`Access_Stairs.Landing` (top of the stairs), `Crew_Elevator.Cab_Lower` / `Cab_Upper` (PrimaryPart = floor; lower cab door on the local −Z face), `Arm_Deck` (access arm; Ana waits 4 studs from the tip of the tower).

Structure suggested in the spec × project: `Workspace.NPCs` and `Workspace.NavigationPoints` live in `NASAComplex.Guides` (single-root rule). `StarterGui.DialogueGui` is created by the client in `PlayerGui` (like the museum and Rookie Rocket screens).

## Stages (server, per player)

`MeetMarcos → FollowMarcos → Museum → Rocket → FollowAna → SuitUp → Elevator → TalkAna → ChooseMission → InMission → Free`

- `SuitUp`: Ana stops in the Crew Suit-Up Room and waits (up to 2 min) for the group to put on the suit at a locker (the `Suit` prompt from Phase 8); the arrow points to the nearest locker.
- `Elevator`: Ana enters the lower cab and waits; `CrewAccess` carries along the NPCs with `GuideNPC` that are in the cab zone, so she rides up with the player. In the cab, Ana's Talk prompt is off (E belongs to the panel).

- Museum: the first ProximityPrompt with the `ExhibitId` attribute (ExhibitService) unlocks `Rocket`.
- `ChooseMission`: on the first experience (no stars on mission 1) only Mercury is unlocked. The same panel chooses the mission, puts on the suit and selects up to two items with visible weight/effects. The client sends `{ action = "Suit" }` or `{ action = "Board", id = 1|2, items = { [equipmentKey] = true } }`. The server validates stage, proximity to Ana and unlock; `CrewSuit` puts on the suit and `RookieBridge.Embarcar(player, id, items)` validates suit, items, 60 kg, seat availability and the shared manifest before teleporting. A `MissionSelect { kind = "Feedback", text = ... }` response keeps the panel open on errors. Overweight fails while still on the pad. On boarding, the panel closes through `RookieMission`; there is no extra preparation in the capsule. Co-op joins the 12 s countdown with the same manifest.
- Leaving the mission (`EmMissao` false): `Free`. Ana at the top keeps opening the selection.

## Rules

- NPCs are in the `GuideNPC` collision group, which does not collide with `GuidePlayer` (player characters) or with itself.
- Automatic doors (`AutoDoor`) get a `PathfindingModifier.PassThrough` so the arrow's path can go through them.
- NPCs stuck for more than 4 s on a stretch are teleported to the next point (the presentation never stalls).

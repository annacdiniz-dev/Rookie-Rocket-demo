> English translation of [`docs/rookie-rocket-spec.md`](../../docs/rookie-rocket-spec.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# SPEC.md — Rookie Rocket (Roblox / Luau)
**Event:** NASA Space Apps Challenge 2026 — *Space Mission Design Game*  
**Engine / Language:** Roblox Studio / Luau (authoritative client-server architecture)  
**Audience:** Teenagers (educational / cooperative simulation)  
**NPC guide:** Marcos Pontes (fictional teaching lines; photos and historical facts only from official NASA sources released for the event).

> **FIXED RULE FOR CREDITS AND TRANSPARENCY:**  
> All weights, times, speeds and equipment effects are **simplified teaching values** for gameplay and learning. This must be explicitly visible on the game's Credits screen.

---

## 1. Overview and Architecture Pillars

1. **Free-roam interior:** The player is **not** locked to a seat. Throughout the mission, players walk freely inside the spacecraft or station (with simulated gravity/magnetic boots, or EVA floating in Mission 2), physically moving between panels, clipboards, hatches and windows.
2. **Panoramic windows and space observation:** Spacecraft are built with wide hatches (`Material = Glass`) and a dynamic space skybox, so players can watch Earth, spinning stars, reentry plasma and external modules in real time.
3. **Cooperative multiplayer (1 to 4 players):** The mission can be played solo or in co-op. In co-op the team shares the rocket's weight limit and the ship's inventory, and works at the stations at the same time.
4. **Full server authority:** The client only renders interfaces and camera effects and sends action intents (`RemoteEvent`). The server validates weights, runs the timers, computes stars and saves data to `DataStoreService`.

---

## 2. Mission Flow and Weight Rules

### 2.1. Execution pipeline
```text
[Boarding the ship (1–4 players)]
       │
       ▼
[Screen: Mission Preparation (synced in co-op)]
       │  └─ Equipment selection (up to 2 items) + live weight bar
       ▼
[Button: LAUNCH] ──(total weight > 60 kg)──► [IMMEDIATE FAILURE: Marcos Pontes line]
       │ (total weight <= 60 kg)
       ▼
[Task 1] ──► [Task 2] ──► [Task 3] ──► [Result screen + stars + NASA card + Album]
   │            │            │
   └──(fail)────┴──(fail)────┴──► [Marcos Pontes explains]
                                    ├─ [Retry the task] (resets the task time, keeps items)
                                    └─ [Restart the mission] (back to Preparation, items can change)
```

### 2.2. Weight system and lightness bonus
* **Ship base weight:** `20 kg`
* **Rocket maximum:** `60 kg`
* **Useful capacity for equipment:** `40 kg` (shared by all players on the ship)
* **Equipment per mission:** 3 options with fixed weights of `15 kg`, `20 kg` and `25 kg`.
  * *Design note:* `20 kg (ship) + 20 kg + 25 kg = 65 kg` (invalid) and `20 + 15 + 20 + 25 = 80 kg` (invalid). So the team can take **at most 2 items** (specifically `15 + 20 = 55 kg` or `15 + 25 = 60 kg`), or only 1 item to maximize the lightness bonus.
* **Live weight bar (Preparation UI):**
  * `<= 50 kg`: **Green**
  * `51 to 60 kg`: **Yellow**
  * `> 60 kg`: **Red** (the **Launch** button stays clickable so the teaching mistake can happen)
  * **Side text:** `"Weight {X} / 60 kg · Free {60 - X} kg"`
* **Lightness bonus:**
  $$\text{LightnessBonus} = \left\lfloor \frac{60 - \text{TotalWeight}}{10} \right\rfloor \times 2 \text{ seconds}$$

---

## 3. Scoring and Stars

Each task has an independent timer on the server that runs only while the task is active (including the time players spend walking inside the ship).

$$\text{FinalTime} = \max(0, \; T_1 + T_2 + T_3 - \text{LightnessBonus})$$

| Final time | Reward | Status |
| :--- | :--- | :--- |
| `<= 45 s` | ⭐⭐⭐ | Mission complete (Gold) |
| `46 s` to `70 s` | ⭐⭐ | Mission complete (Silver) |
| `71 s` to `100 s` | ⭐ | Mission complete (Bronze) |
| `> 100 s` | `0 stars` | **Failure:** *"Took too long"* |

* **Required format on the result screen:**  
  `"T1 12 s + T2 18 s + T3 15 s − 4 s lightness = 41 s · ⭐⭐⭐"`

---

## 4. Mission Specification (Level Design, Tasks and Co-op)

### 4.1. Mission 1 · Project Mercury (Friendship 7 / Aurora 7)

#### Environment and navigation
* **Setting:** A walkable space capsule interior, enlarged for free movement (1–4 players), split into 3 physical stations:
  1. **Front panel and periscope** (with a wide front panoramic window).
  2. **Side window and navigation table** (where the physical clipboard with the code sits).
  3. **Radio console and retropack** (communication panel and reentry levers/buttons).
* **External visual effects (windows):**
  * *Task 1:* Skybox/stars spinning fast outside the windows; pulsing red interior light.
  * *Task 3:* Particles and intense orange/red glow (atmospheric reentry plasma) passing the windows.

#### Mission 1 equipment
| Equipment | Weight | Target task | Mechanical effect |
| :--- | :--- | :--- | :--- |
| **Gyroscope** | `15 kg` | Task 1 | Reduces the hold time on each point: `2.0 s` → `1.2 s` |
| **Flight Manual** | `20 kg` | Task 2 | Visually highlights the code on the clipboard and adds `+15 s` to the timer (`30 s` → `45 s`) |
| **Reinforced Shield** | `25 kg` | Task 3 | Reduces the "Hold Retropack" time: `10.0 s` → `6.0 s` and reduces camera shake |

#### Mission 1 tasks
* **Task 1 · The Autopilot Failure**
  * **Alert:** `"AUTOMATIC SYSTEM FAILURE"` + light camera shake.
  * **Mechanic:** The player walks to the panoramic windows (or activates the manual sight without locking movement), centers the crosshair (`+`) on **4 red points** outside the ship and holds until the radial circle fills (`2.0 s` base / `1.2 s` with the Gyroscope).
  * **Co-op:** Several players can look through different windows and lock points at the same time.
  * **Failure:** Passing `40 s`.

* **Task 2 · The Communication Blackout**
  * **Alert:** `"LOSS OF CONTACT WITH EARTH"` + static/hiss on the radio.
  * **Mechanic:** The player walks to the navigation table to read a randomly generated code on the physical clipboard (highlighted in yellow if the *Flight Manual* is equipped) and types it on the radio panel. Next to the keypad, a red **"EJECT CAPSULE"** button blinks constantly.
  * **Success feedback:** The static stops and the audio/subtitle plays: *"Friendship 7, we read you. Welcome back."*
  * **Co-op:** One player reads the clipboard while another is already at the radio panel typing the code.
  * **Failure:** Clicking **"EJECT CAPSULE"** or the timer expiring (`30 s` base / `45 s` with the Manual). Typing a wrong code only shows `"Invalid code"` and does not fail.

* **Task 3 · The Heat Shield Alarm**
  * **Alert:** `"DANGER: HEAT SHIELD SENSOR UNSTABLE"` + a `10 s` decision timer.
  * **Mechanic:** The player runs to the reentry console, which has two physical/UI buttons: **"EJECT CAPSULE"** (red) and **"HOLD RETROPACK"** (green). On choosing *Hold*, the cabin turns red with heat and shakes, and the player must hold the button until the bar fills (`10 s` base / `6 s` with the Shield). Releasing the button only pauses progress (it does not fail).
  * **Co-op:** If two or more players hold the redundant buttons at the same time, the visual shaking is reduced.
  * **Failure:** Clicking **"EJECT CAPSULE"** or making no decision within the first `10 s`.

---

### 4.2. Mission 2 · International Space Station (ISS)

#### Environment and navigation
* **Setting:** An ISS habitable module connected directly to the **Cupola** (a dome with 7 panoramic windows facing Earth) and a working **Airlock** for a spacewalk (EVA).
* **External visual effects:** An orbital view of sunlit Earth, external solar arrays and the *Unity* and *Zarya* modules visible in real time through the Cupola windows.

#### Mission 2 equipment
| Equipment | Weight | Target task | Mechanical effect |
| :--- | :--- | :--- | :--- |
| **Pressure Sensor** | `15 kg` | Task 1 | Increases the green zone of the pressure slider by `+50%` |
| **Grip Gloves** | `20 kg` | Task 2 | Lets you drag the loose cables `2x` faster without slipping |
| **Sealing Kit** | `25 kg` | Task 3 | Reduces the pressure drop rate by `40%` and the sealing time: `3.0 s` → `2.0 s` |

#### Mission 2 tasks
* **Task 1 · The Docking (Unity & Zarya, STS-88, 1998)**
  * **Alert:** `"ARM PRESSURE TOO HIGH"`.
  * **Mechanic:** Inside the Cupola, looking at the misaligned modules through the windows, the player uses the robotic arm (`Canadarm`) console: aligns **4 spheres** on **4 targets (`X`)** and adjusts a **pressure slider** to keep it inside the green zone. On completion a mechanical `"clack"` plays, lights turn green and the modules lock together outside.
  * **Co-op:** One player aligns the 4 spheres while another only regulates the pressure slider.
  * **Failure:** Keeping pressure at maximum for `3 s` in a row (collision between modules) or passing `40 s` (the Zarya module drifts away).

* **Task 2 · The Stuck Solar Panel (STS-97, 2000)**
  * **Mechanic:** Spacewalk (EVA). Players go out through the Airlock to the station's exterior (free 3D floating with gentle thrusters and a visual safety tether) with Earth in the background. There are **2 loose cables** floating; the player must drag each cable to its pulley (green circle). If dragged too fast (above the limit), the cable slips and returns to its original position (no Game Over).
  * **Co-op:** Each player takes one cable and brings it to its pulley at the same time.
  * **Failure:** Passing `45 s`.

* **Task 3 · The 2 mm Leak (Soyuz MS-09, 2018)**
  * **Mechanic:** Alarm sound, red emergency lights, the sound of air escaping and the cabin pressure needle falling continuously. Required sequence:
    1. Run to the hatch of the adjacent module and close it via `ProximityPrompt` (reduces the air loss rate).
    2. Find the 2 mm hole in the wall (marked by air particles being sucked in).
    3. Collect the **"Epoxy Gauze"** from the toolbox and hold the click on the hole (`3.0 s` base / `2.0 s` with the Sealing Kit).
  * **Co-op:** One player runs at once to close the hatch while another already fetches the Epoxy Gauze and finds the leak.
  * **Failure:** Cabin pressure reaching `0%`.

---

## 5. Teaching System: Marcos Pontes Dialogues

Every failure stops the run immediately and shows the **Marcos Pontes** NPC modal with:
1. What happened technically;
2. The parallel with the real NASA historical event;
3. A single objective tip tied to the chosen equipment.

### Triggers and lines
| Failure trigger | Marcos Pontes text |
| :--- | :--- |
| **Weight > 60 kg at launch** | `"{name}, the rocket can only carry 60 kg and the ship weighed {weight} kg. It never left the pad! In space engineering every kilogram counts: choose together only what helps the most."` |
| **Ejecting in Task 2 (Mission 1)** | `"Ejecting during reentry would be fatal. John Glenn went 4 minutes without radio and trusted his training. Sometimes the right answer is to stay calm and follow the procedure."` |
| **Ejecting in Task 3 (Mission 1)** | `"It was a sensor error! The shield was secure. Ejecting in panic loses the mission. Keeping the retropack on was NASA's real decision."` |
| **Maximum pressure in Task 1 (Mission 2)** | `"Too much force crushes the module! On STS-88, the fix was to ease the pressure on the arm, not to push harder."` |
| **Time / pressure exhausted (without the task's item)** | `"Out of time, {name}. The {equipment} would have helped right here. Next time, talk it over and decide which task is hardest for your team."` |
| **Time / pressure exhausted (with the task's item)** | `"So close, {name}! Even with the {equipment}, time ran short. Split the ship's stations better and try again."` |
| **Mission success** | `"Excellent work, team! You made decisions like real NASA astronauts. Check the historical record of this mission in your album!"` |

---

## 6. File Architecture and Code Standards (Luau)

All scripts must carry clear comments in **Portuguese** to make maintenance easier for the team's beginner programmers.

```text
ReplicatedStorage/
 ├── Config/
 │    └── Missoes.lua                 -- SINGLE ModuleScript with all constants, weights, timers, stars and lines
 └── Remotes/
      ├── SelecionarEquipamento       -- RemoteEvent (Client -> Server)
      ├── IniciarLancamento           -- RemoteEvent (Client -> Server)
      ├── AcaoTask                    -- RemoteEvent (Client -> Server: point progress, code, hatch, etc.)
      ├── ReiniciarTaskOuMissao       -- RemoteEvent (Client -> Server: mode "Task" or "Missao")
      └── SincronizarEstado           -- RemoteEvent (Server -> AllClients: ship state, timers, weight, failures)

ServerScriptService/
 ├── GerenciadorMissao.server.lua     -- Mission state machine, weight validation, timers and rules
 └── DataStoreManager.server.lua      -- Safe persistence (pcall) of best stars per mission and Album cards

StarterPlayer/
 └── StarterPlayerScripts/
      ├── NavegacaoNave.client.lua    -- Handles free movement, EVA mode (Task 2 M2) and camera/window effects
      ├── UIPreparacao.client.lua     -- Co-op Preparation screen, live weight bar and equipment selection
      └── UITasksEFeedback.client.lua -- Task HUD, timer, Marcos Pontes bubble, result and NASA Album
```

### Skeleton of `ReplicatedStorage/Config/Missoes.lua`
```lua
-- WARNING: All weights, times and multipliers below are TEACHING VALUES
-- simplified for educational balancing (state this in the game's credits).

local Missoes = {}

Missoes.RegrasGerais = {
	PesoNave = 20, -- kg
	LimiteFoguete = 60, -- kg
	KgPorBonus = 10, -- for every 10 kg free...
	SegundosBonusPorFaixa = 2, -- ...take 2 seconds off the final time
	MaxJogadoresPorNave = 4,
	FaixasEstrelas = {
		TresEstrelas = 45, -- up to 45 s
		DuasEstrelas = 70, -- up to 70 s
		UmaEstrela = 100,  -- up to 100 s
	}
}

Missoes.Lista = {
	[1] = {
		Id = 1,
		Nome = "Project Mercury (Friendship 7)",
		Equipamentos = {
			Giroscopio = { Nome = "Gyroscope", Peso = 15, TaskAlvo = 1, TempoSegurar = 1.2 },
			ManualBordo = { Nome = "Flight Manual", Peso = 20, TaskAlvo = 2, BonusTempo = 15 },
			EscudoReforcado = { Nome = "Reinforced Shield", Peso = 25, TaskAlvo = 3, TempoSegurar = 6.0 }
		},
		Tasks = {
			[1] = { Nome = "The Autopilot Failure", LimiteTempo = 40, TempoBaseSegurar = 2.0, TotalPontos = 4 },
			[2] = { Nome = "The Communication Blackout", LimiteTempo = 30 },
			[3] = { Nome = "The Heat Shield Alarm", TempoDecisao = 10, TempoBaseSegurar = 10.0 }
		}
	},
	[2] = {
		Id = 2,
		Nome = "International Space Station (ISS)",
		Equipamentos = {
			SensorPressao = { Nome = "Pressure Sensor", Peso = 15, TaskAlvo = 1, MultiplicadorZonaVerde = 1.5 },
			LuvasAderentes = { Nome = "Grip Gloves", Peso = 20, TaskAlvo = 2, MultiplicadorVelocidade = 2.0 },
			KitVedacao = { Nome = "Sealing Kit", Peso = 25, TaskAlvo = 3, ReducaoPerdaAr = 0.6, TempoSegurar = 2.0 }
		},
		Tasks = {
			[1] = { Nome = "The Docking (STS-88)", LimiteTempo = 40, TempoPressaoMaxFalha = 3.0 },
			[2] = { Nome = "The Stuck Solar Panel (STS-97)", LimiteTempo = 45, TotalCabos = 2 },
			[3] = { Nome = "The 2 mm Leak (Soyuz MS-09)", TempoBaseSegurar = 3.0, TaxaPerdaArBase = 2.5 }
		}
	}
}

Missoes.FalasMarcos = {
	ExcessoPeso = "{name}, the rocket can only carry 60 kg and the ship weighed {weight} kg. It never left the pad! In space engineering every kilogram counts: choose together only what helps the most.",
	EjetarBlackout = "Ejecting during reentry would be fatal. John Glenn went 4 minutes without radio and trusted his training. Sometimes the right answer is to stay calm and follow the procedure.",
	EjetarEscudo = "It was a sensor error! The shield was secure. Ejecting in panic loses the mission. Keeping the retropack on was NASA's real decision.",
	PressaoMaximaAcoplamento = "Too much force crushes the module! On STS-88, the fix was to ease the pressure on the arm, not to push harder.",
	FaltaTempoSemItem = "Out of time, {name}. The {equipment} would have helped right here. Next time, talk it over and decide which task is hardest for your team."
}

return Missoes
```

### Security contract (client vs. server)
* **Forbidden:** The client **never** sends the time spent on a task, the computed total weight or the number of stars earned.
* **Required:** The server records `os.clock()` at the start and end of each task, validates that the requested equipment belongs to that mission, and checks that players are close enough to the `ProximityPrompts` before accepting critical actions (such as closing the hatch or typing on the radio).

---

## 7. Build Order and Acceptance Criteria (Definition of Done)

The implementation must follow this sequence strictly. **If hackathon time runs short, cut Mission 2 entirely, never halfway.**

1. **Phase 1 — Config, navigation and preparation:**
   * Create `ReplicatedStorage/Config/Missoes.lua` with every value parameterized.
   * Build the Mercury capsule interior with large windows and working free movement.
   * Implement the Preparation UI (solo and co-op) with a live weight bar (green/yellow/red) and server-side failure validation above `60 kg`.
2. **Phase 2 — Mission 1 complete:**
   * Implement the 3 physical stations in the capsule (alignment windows, clipboard + radio, retropack console).
   * Wire all 3 items (`Gyroscope`, `Flight Manual`, `Reinforced Shield`) so each mechanically changes its task.
   * Implement all of Marcos Pontes's failure lines and the `"Retry the task"` and `"Restart the mission"` buttons.
3. **Phase 3 — Scoring, Album and DataStore:**
   * Implement the result screen with the detailed equation (`T1 + T2 + T3 - Bonus = Total · Stars`).
   * Implement the Album with the official NASA historical cards and persistence through `DataStoreService`.
4. **Phase 4 — Mission 2 complete:**
   * Build the ISS module with a panoramic Cupola and an Airlock for EVA.
   * Implement the 3 tasks (`STS-88`, `STS-97` on EVA, `Soyuz MS-09`) with co-op support and the 3 items (`Pressure Sensor`, `Grip Gloves`, `Sealing Kit`).

### Required test checklist before delivery
- [ ] Selecting all 3 items together (`80 kg`) lets you click **Launch**, fails immediately on the pad and shows Marcos's correct overweight line.
- [ ] Each of the 6 items (3 from Mission 1 + 3 from Mission 2) visibly and numerically changes its target task.
- [ ] Players can walk freely around the ship during every task and watch space through the panoramic windows.
- [ ] In co-op (2+ players), the weight bar and the task objectives sync correctly across all clients.
- [ ] `"Retry the task"` resets only the current task's timer and keeps the chosen equipment.
- [ ] `"Restart the mission"` returns all players to Preparation and lets them change equipment.
- [ ] The final equation shown on screen exactly matches the sum of the server timers minus the lightness bonus.

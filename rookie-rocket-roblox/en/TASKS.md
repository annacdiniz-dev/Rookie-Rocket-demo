> English translation of [`TASKS.md`](../TASKS.md), a snapshot for readers. The Portuguese file at the folder root is the live task board; identifiers, paths and code are unchanged.

# Tasks

One line per task. Before starting, fill in the owner, the branch and the files you will touch. Two tasks in progress cannot share files.

Owners: `claude` (Claude Code), `codex` (Codex), `mac` (test in Studio), or a person's name. Everything runs on this Mac (see `docs/colaboracao.md`).

| # | Task | Owner | Branch | Files | State |
|---|---|---|---|---|---|
| 1 | Integration test Linux → GitHub → Mac → Rojo → Studio | claude + mac | `setup/linux-colaboracao` | `build/tests/IntegracaoLinux.server.luau`, `default.project.json` | cancelled (no Linux) |
| 2 | Connect the Studio MCP to Linux over SSH (Tailscale) | mac + claude | — | none in the repository | cancelled (no Linux) |
| 3 | Museum: hall (Phase 16) | codex | `codex/museu-salao` | `build/phase16_museum_hall.luau` | awaiting test on the Mac (visual) |
| 4 | Museum: exhibits (Phase 17) | codex | `codex/museu-exposicoes` | `build/phase17_museum_exhibits.luau` | awaiting test on the Mac (visual) |
| 5 | Museum: systems and content (Phase 18, Rojo) | claude | `setup/linux-colaboracao` | `build/museum/**`, `build/phase18_museum_systems.luau`, `default.project.json`, `build/run_in_studio.luau`, `docs/museu-contrato.md` | awaiting test on the Mac (visual) |
| 6 | Rookie Rocket: Mercury and ISS missions (docs/rookie-rocket-spec.md) | claude + codex | `claude/rookie-rocket` (+ `codex/rookie-mercury`, `codex/rookie-iss`) | `build/rookie/**`, `build/phase19_rookie_mercury.luau`, `build/phase20_rookie_iss.luau`, `build/phase21_rookie_systems.luau`, `default.project.json`, `build/run_in_studio.luau` | awaiting test in Studio |
| 7 | Guides Marcos Pontes and Ana + navigation arrow (docs/guias-spec.md) | claude | `claude/rookie-rocket` | `build/guide/**`, `build/phase22_guides.luau`, `build/rookie/server/GerenciadorMissao.server.luau` (bridge), `default.project.json`, `build/run_in_studio.luau`, `docs/guias-*.md` | awaiting test in Studio |
| 8 | Missions: mandatory suit, compact capsules, local gravity, arrow and trade-off with Ana | codex | `codex/missoes-capsula` | `build/phase19_rookie_mercury.luau`, `build/phase20_rookie_iss.luau`, `build/systems/server/CrewAccess.server.luau`, `build/rookie/server/{GerenciadorMissao.server,Sessao,Naves,TasksMercury,TasksISS}.luau`, `build/rookie/client/{RookieClient.client,Capsule,Hud}.luau`, `build/guide/server/NPCService.luau`, `build/guide/client/{MissionSelect,NavigationClient}.luau`, `docs/rookie-contrato.md`, `docs/guias-contrato.md`, `IMPLEMENTATION.md`, `TASKS.md` | awaiting test on the Mac; commit/push/PR blocked by the Git sandbox and the GitHub connector without access (404) |
| 9 | Improvements after the playtest (docs/rookie-melhorias-playtest.md) | claude | `claude/rookie-rocket` | `build/guide/**`, `build/rookie/**`, `build/museum/client/PanelController.luau`, `build/phase19_rookie_mercury.luau`, `build/phase20_rookie_iss.luau`, `docs/rookie-contrato.md`, `docs/rookie-melhorias-playtest.md` | awaiting test in Studio |
| 10 | Museum: Explore rocket on the Saturn V (docs/museu-foguete-interativo.md) | claude | `claude/rookie-rocket` | `build/museum/client/{RocketExplorer,PanelController}.luau`, `build/museum/shared/{Text,Content/Photos,Content/Exhibits/SaturnV}.luau`, `build/rookie/client/Modais.luau`, `docs/museu-*.md` | awaiting test in Studio (touch, gamepad, 2 players) |
| 11 | Mission Flight Manifest in two tabs (mission → items with icons) | codex + claude | `codex/manifest-abas` | `build/guide/client/MissionSelect.luau`, `build/guide/client/ItemIcons.luau` (new), `build/rookie/shared/Missoes.luau` (new text fields only) | applied to the place; tested in Play on PC |
| 12 | Landscaping and outdoor setting (docs/paisagismo-spec.md) | claude | `claude/rookie-rocket` | `build/phase23_landscape.luau`, `build/phase24_outdoor.luau` (new), `build/run_in_studio.luau`, `CLAUDE.md`, `docs/paisagismo-spec.md` | applied to the place; look still to be checked |

States: `to do`, `in progress`, `PR open`, `awaiting test on the Mac`, `done`, `cancelled`.

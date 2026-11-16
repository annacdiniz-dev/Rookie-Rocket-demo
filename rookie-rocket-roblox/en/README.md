# Rookie Rocket · Roblox project documents in English

This folder holds **English translations** of the documents of the Roblox project. The originals, in Portuguese, stay where they are in [`rookie-rocket-roblox/`](../) and remain the working copies: the team and its tools read and update those. If a translation and an original ever disagree, the original wins.

Each file here mirrors the path of its original and starts with a link back to it. Identifiers, file paths, coordinates and code were left exactly as they are; only prose, and comments inside example code, were translated.

For an overview of the whole repository, including the playable web demo, see the [main README](../../README.md).

> **Translation in progress.** Still to come: `spec.md`, `spec-v3.md`, `spec-ultimate.md`, `missaoUm.md`, `museuspec.md` and `IMPLEMENTATION.md`. Their links below will work once they are added.

## Start here

| Document | What it covers |
|---|---|
| [`docs/rookie-rocket-spec.md`](docs/rookie-rocket-spec.md) | The mission design: Mercury and ISS, co-op, weight, stars, the Album |
| [`docs/rookie-contrato.md`](docs/rookie-contrato.md) | The contract between map parts and mission scripts |
| [`docs/guias-spec.md`](docs/guias-spec.md) | The guide NPCs and the tour of the complex |
| [`docs/marcos-pontes-spec.md`](docs/marcos-pontes-spec.md) | How the Marcos Pontes character is represented, and the limits on doing so |
| [`CLAUDE.md`](CLAUDE.md) | How the map is generated phase by phase, and the validations that must keep passing |
| [`ROJO.md`](ROJO.md) | Setting up Rojo, VS Code and Roblox Studio |

## All documents

**Missions and guides**
- [`docs/rookie-rocket-spec.md`](docs/rookie-rocket-spec.md) · mission spec
- [`docs/rookie-contrato.md`](docs/rookie-contrato.md) · parts × scripts contract for the missions
- [`docs/rookie-melhorias-playtest.md`](docs/rookie-melhorias-playtest.md) · improvements requested after the playtest
- [`docs/guias-spec.md`](docs/guias-spec.md) · guide NPCs
- [`docs/guias-contrato.md`](docs/guias-contrato.md) · parts × scripts contract for the guides
- [`docs/marcos-pontes-spec.md`](docs/marcos-pontes-spec.md) · the Marcos Pontes NPC
- [`missaoUm.md`](missaoUm.md) · the earlier seated Friendship 7 mission (replaced)
- [`contianuacao.md`](contianuacao.md) · hand-off note for that earlier mission

**Museum**
- [`museuspec.md`](museuspec.md) · museum spec
- [`docs/museu-contrato.md`](docs/museu-contrato.md) · museum contract and layout revisions
- [`docs/museu-foguete-interativo.md`](docs/museu-foguete-interativo.md) · the explorable Saturn V

**Map**
- [`spec-v3.md`](spec-v3.md) · current map spec
- [`spec.md`](spec.md) · first map spec, still valid where v3 does not change it
- [`spec-ultimate.md`](spec-ultimate.md) · historical
- [`docs/paisagismo-spec.md`](docs/paisagismo-spec.md) · landscaping and outdoor setting
- [`IMPLEMENTATION.md`](IMPLEMENTATION.md) · the state of every build step

**Workflow**
- [`CLAUDE.md`](CLAUDE.md) · project instructions
- [`AGENTS.md`](AGENTS.md) · rules for working in parallel
- [`TASKS.md`](TASKS.md) · task board (snapshot)
- [`docs/colaboracao.md`](docs/colaboracao.md) · how the agents collaborate
- [`ROJO.md`](ROJO.md) · Rojo, VS Code and GitHub
- [`skills/codex.md`](skills/codex.md), [`skills/llm-gratis.md`](skills/llm-gratis.md) · the two helper skills
- [`assets/LICENSES.md`](assets/LICENSES.md) · asset licenses

## Not translated

The Luau source in `build/` keeps its comments in Portuguese, by project convention. All text shown to players in the game is already in English.

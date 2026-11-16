> English translation of [`AGENTS.md`](../AGENTS.md), for readers only. The Portuguese file at the folder root is the original and is the one the project's tools follow; identifiers, paths and code are unchanged.

# Instructions for Codex (and other agents)

The project rules are in [`CLAUDE.md`](CLAUDE.md): a phase-based generator in `build/`, validations, Studio through the MCP. Read that file before any change. This file only adds the rules for working in parallel.

## Before starting

1. Take a free task in [`TASKS.md`](TASKS.md), set `codex` as the owner and list the files you will touch.
2. Work in your own worktree and branch, never on `main`:
   `scripts/worktree-novo.sh codex <short-name>` creates `../roockie-rocket-wt/codex-<short-name>` on the branch `codex/<short-name>`.
3. Only edit the files you listed in the task. If you need another file that a task in progress has already reserved, stop and say so.

## Files with a single owner

- `Place1.rbxl` is binary and cannot be merged. Only the MacBook (Studio) commits that file, after saving the place in Studio.
- `build/run_in_studio.luau` and `build/lib.luau` are used by every phase. Whoever changes these files must do it in a task of their own, alone.
- Each phase (`build/phaseN_*.luau`) belongs to one task at a time.

## When finished

- Run `stylua --check build` and `selene build` if they are installed.
- Update `IMPLEMENTATION.md` and the task in `TASKS.md`.
- Commit on your branch, push, open a Pull Request to `main`. Never push directly to `main`.
- In the PR, say what needs to be run in Studio to test (which phases, which playtest).

## When Claude Code calls you

Everything runs on the same Mac. You run without the Studio MCP: if you need something in Studio (run a generator, measure, capture), ask Claude in your answer.

Claude Code may send tasks through `codex exec` (the `.claude/skills/codex` skill). Treat its message as a task from the user: follow the rules above and answer at the end with what changed, the branch and what is left to test in Studio.

## Conventions

- Code and comments follow the style of the existing generators (tabs, names in English, comments in Portuguese).
- Texts visible in the game in English (the `CLAUDE.md` rule).
- External 3D models only from the Roblox Creator Store, with the ID and the license in `assets/LICENSES.md`.

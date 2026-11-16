> English translation of [`docs/colaboracao.md`](../../docs/colaboracao.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# Collaboration between agents (MacBook only)

Everything runs on this Mac: Claude Code, Codex, Roblox Studio, `rojo serve` and the generators' HTTP server. There is no other computer and no remote access (the old setup with Linux, SSH and Tailscale was abandoned on November 15, 2026).

## How the code reaches Studio

- **Rojo** (`rojo serve` on this Mac): the scripts listed in `default.project.json` enter Studio on save.
- **Generators** (`build/phase*.luau`): run in Studio through the local HTTP server (`python3 -m http.server 8765 --bind 127.0.0.1` in `build/`) and `run_in_studio.luau`.

GitHub serves only as history and for Pull Requests, not as a bridge between machines.

## Agents

- **Claude Code**: integrates, runs the generators and the Studio MCP, tests and reviews.
- **Codex** (the CLI that ships in the ChatGPT app: `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex`): called by Claude with `.claude/skills/codex/codex-ask.sh` (`codex exec`). Without the Studio MCP (in non-interactive mode it does not approve `execute_luau`); Claude runs whatever is needed in Studio and returns the result.

## Working in parallel

- Each agent that edits code works in its own worktree: `scripts/worktree-novo.sh claude <task>` or `scripts/worktree-novo.sh codex <task>` (folders in `../roockie-rocket-wt/`).
- Worktrees that need the HTTP server use their own port (8766, 8767, …) so they do not mix with the main checkout (8765).
- `TASKS.md` says who is touching which files. Two open tasks do not share files.
- Everything enters `main` through a Pull Request.
- `Place1.rbxl` is only committed after saving the place in Studio (Ctrl+S).
- Only one agent uses Studio at a time (Claude); Studio's Rojo points to the main checkout.

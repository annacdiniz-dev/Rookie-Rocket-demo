> English translation of [`ROJO.md`](../ROJO.md). The Portuguese file is the original; identifiers, paths and code are unchanged.

# GitHub + VS Code + Rojo — usage guide

## How the project is divided

| What | Where it lives | How it reaches Studio |
|---|---|---|
| Rookie Rocket mission scripts | `build/rookie/**/*.luau` | **Rojo**, live (`default.project.json`) |
| Museum scripts | `build/museum/{server,client,shared}` | **Rojo** |
| Map scripts: doors (AutomaticDoors), crew (CrewAccess) | `build/systems/server/` → `ServerScriptService.Map_Systems` | **Rojo** |
| Client-side map scripts: planets (PlanetOrbits), elevator screen (CrewClient) | `build/systems/client/` → `StarterPlayerScripts.MapClient` | **Rojo** |
| Map (parts, lights, signs) | `build/phase*.luau` | HTTP server + `run_in_studio.luau` (see `CLAUDE.md`) |

Rules:
- Rojo manages only the script folders above. The rest of the place (Workspace, Lighting) is left untouched.
- With Rojo connected, the phases see the `RojoManaged` attribute and do not reinstall the scripts; they only create the parts.
- Do not use `rojo build` to generate the place: the map is not in the Rojo project.

## Installation (once)

In the Terminal:

1. Download Rokit, the official installer for Rojo tools (Mac with Apple Silicon):

```bash
curl -sSLo /tmp/rokit.zip https://github.com/rojo-rbx/rokit/releases/download/v1.2.0/rokit-1.2.0-macos-aarch64.zip && unzip -o /tmp/rokit.zip -d /tmp/rokit && /tmp/rokit/rokit self-install
```

2. Close and reopen the Terminal. Then install Rojo 7.7.1, pinned in `rokit.toml`; answer "yes" to trust Rojo:

```bash
cd ~/Documents/nasa && rokit install
```

3. Install the Rojo plugin in Studio, then close and reopen Studio:

```bash
cd ~/Documents/nasa && rojo plugin install
```

In VS Code:

4. Open the folder `~/Documents/nasa` (File → Open Folder).
5. Extensions (already installed on this Mac on November 15, 2026): **Rojo** (`evaera.vscode-rojo`), **Luau Language Server** (`JohnnyMorganz.luau-lsp`) and **Claude Code** (`anthropic.claude-code`). If the notice does not appear, open Extensions and type `@recommended`.
6. Optional: in the Command Palette (Cmd+Shift+P), run "Shell Command: Install 'code' command in PATH".
7. GitHub: the repository is already linked at `git@github.com:tulioamaral123/roockie-rocket.git`, over SSH, and it works. The VS Code Source Control tab uses that git for commit, push and pull. To see PRs and issues in the editor, install the "GitHub Pull Requests" extension and sign in with your account.

## Daily use

1. Open `Place1.rbxl` in Studio and the folder in VS Code.
2. Start the Rojo server, in one of these ways:
   - VS Code: Cmd+Shift+P → "Rojo: Open menu" → `default.project.json` → Start.
   - Terminal: `cd ~/Documents/nasa && rojo serve`
3. In Studio, open the Plugins tab → Rojo → **Connect** (localhost:34872).
4. Edit any file in `build/rookie/`, `build/museum/` or `build/systems/` and save: the script changes in Studio right away.
5. When done, commit and push from the Source Control tab (or `git`), and save the place in Studio (Ctrl+S).

## Common problems

- **Rojo asks to replace instances on connect.** That is normal on the first connection: the scripts already existed, created by Phases 18 and 21. Accept.
- **`rojo: command not found`.** Open a new Terminal after `rokit self-install`; it adds `~/.rokit/bin` to the PATH.
- **The plugin does not appear.** Close Studio completely and open it again after `rojo plugin install`.

## Programming with Claude while spending fewer tokens

1. In VS Code, open Claude Code from the ✱ icon in the sidebar (or Cmd+Esc).
2. Ask for changes by naming the file: "in `build/systems/server/CrewAccess.server.luau`, do X". It edits the file and Rojo carries it to Studio.
3. Test it yourself in Studio (Play). If there is an error, copy **only the red line** from the Output and paste it in the chat.
4. One conversation per task: when done, `/clear` (or a new conversation).
5. Simple tasks: the Sonnet model (`/model`). Keep Opus for the hard ones.
6. Avoid asking for screenshots or "look in Studio": that is what costs the most.
7. Changing the map (parts) still requires running the generators over HTTP; batch those changes.

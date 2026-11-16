> English translation of [`.claude/skills/codex/SKILL.md`](../../.claude/skills/codex/SKILL.md), for readers only. It is stored as a plain document, without the skill header, so tools do not load it as a second copy of the skill. The Portuguese file is the original.

**Skill name:** `codex`
**Description:** Talk to Codex (OpenAI) from the terminal to split tasks, ask for a review or a second opinion. Use it when the user says "ask Codex", "have Codex do it", "what does Codex think", or when a task can go to Codex in parallel in a separate worktree.

# Talking to Codex

Codex runs headless through `codex exec`. The `codex-ask.sh` script (in the skill's folder) opens or continues a conversation and returns the final answer.

## Rules

- **Separate folders.** A task that edits files goes to a Codex worktree, never to the folder where Claude is working. Create it with `scripts/worktree-novo.sh codex <task>` (result: `../roockie-rocket-wt/codex-<task>`, branch `codex/<task>`).
- Record the task in `TASKS.md` with `codex` as owner and its files before sending it.
- Sandbox: `read-only` for questions and reviews; `workspace-write` only inside Codex's worktree.
- It runs on this Mac: the script finds the ChatGPT app's CLI if `codex` is not on the PATH and turns off the Studio MCP (Studio stays with Claude). The account is the one from the `CODEX_HOME` inherited from the terminal. Do not change Codex's login or config.
- Each call can take minutes: run it in the background (`run_in_background`) when it is a code task, and keep working.
- Codex reads `AGENTS.md`. In the message, state the task, the allowed files and what to deliver (diff, summary, commit on its branch).

## Usage

New conversation (keep the `THREAD_ID` printed on the first line):

```bash
.claude/skills/codex/codex-ask.sh new ../roockie-rocket-wt/codex-placas workspace-write "Task 3 in TASKS.md: ... Only touch build/phase4_decoration.luau. When done, commit on your branch and tell me what changed."
```

Continue the same conversation (Codex remembers the context):

```bash
.claude/skills/codex/codex-ask.sh resume <THREAD_ID> "X is missing. Adjust it and show me the diff."
```

A quick question or review, without editing anything:

```bash
.claude/skills/codex/codex-ask.sh new . read-only "Review build/mission/Task1ControlService.luau looking for replication bugs. List problems with line numbers."
```

## After the answer

- Check what Codex did (`git -C <worktree> log -3 --stat`, `git -C <worktree> diff main...`) before telling the user it is ready.
- Summarize for the user in Portuguese: what Codex did, what is still missing, and if you disagree with something, why.
- Integration always through a Pull Request, as in `AGENTS.md`.

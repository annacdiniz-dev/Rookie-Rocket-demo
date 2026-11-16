> English translation of [`.claude/skills/llm-gratis/SKILL.md`](../../.claude/skills/llm-gratis/SKILL.md), for readers only. It is stored as a plain document, without the skill header, so tools do not load it as a second copy of the skill. The Portuguese file is the original.

**Skill name:** `llm-gratis` ("free LLM")
**Description:** Delegate simple, high-volume text tasks to a free keyless LLM (Kilo/LLM7; Groq/Gemini optional) to save Claude's limit. Use it to translate/review sign and card texts, summarize large files (specs, logs, reports) before reading, and generate drafts, lists and descriptions. Also when the user says "send it to the free model" or "use Groq/Gemini". Do not use it for the map's Luau code.

# Delegating to a free LLM

`ask.py` (in the skill's folder) sends the request and returns only the answer. The gain comes from **me not reading the large input**: the file goes straight to the free model and I receive only the short result.

## When it pays off

- Large input and small output: summarizing a spec, the Output log, a report, `data.json`.
- Text in volume: translating/reviewing museum signs and cards, generating exhibit descriptions.
- **Do not** use it for Luau code, generators, architecture decisions or anything I need to review line by line (the saving disappears there).
- If the task is small (it fits in a short answer of mine), do it directly: delegating costs a call.

## Rules

- Pass files with `-f` (do not `cat`/`Read` them first, or I spend the tokens anyway).
- Ask for a short output in the exact format I need (list, table, JSON).
- Check the result by sampling; free models make more mistakes.
- **Privacy:** keyless providers (Kilo, LLM7) may log prompts and answers. Send only project content that can be public (specs, sign texts, Output logs); no keys, passwords, `.env` or personal data.
- Default: `kilo` (no key, 200 requests/hour per IP, 1M context, ~5–10 s). Backup: `-p llm7` (no key, 128K context). Groq/Gemini only if there is a key in `~/.config/llm-gratis/keys.env`.
- If a provider fails (429, the catalog changed), try the other one or another model with `-m`.

## Usage

```bash
.claude/skills/llm-gratis/ask.py -f spec-v3.md "List in up to 10 lines everything the spec says about the observation room, with the section number."
.claude/skills/llm-gratis/ask.py -f build/museum/cards.json "Review the English of these texts; return only the changed lines as 'before -> after'."
pbpaste | .claude/skills/llm-gratis/ask.py "Summarize this Output error in 3 lines and name the likely file/line."
```

Options: `-p kilo|llm7|groq|gemini` (default kilo, or `LLM_GRATIS_PROVIDER`), `-m model` (kilo: `nvidia/nemotron-3.5-lightning:free`, `kilo-auto/free`, `nvidia/nemotron-3-ultra-550b-a55b:free` (slow, stronger); llm7: `gpt-oss:20b`; groq: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`; gemini: `gemini-3.8-flash`, `gemini-2.5-flash`), `-s` system instruction, `--max-tokens`.

## Keys (optional)

In `~/.config/llm-gratis/keys.env` (permission 600), one per line:

```
GROQ_API_KEY=...
GEMINI_API_KEY=...
```

Groq: https://console.groq.com/keys · Gemini: https://aistudio.google.com/apikey

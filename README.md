# Memory System for Claude Code

3-layer hierarchical memory skill for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with session tracking, auto-logging, and plan-aware context management.

## What It Does

- **L3 Core Memory** — Persistent project knowledge, user preferences, agent identity
- **L2 Session State** — `SESSION.md` tracks current phase/task progress (overwritten each checkpoint)
- **L2 Work History** — `WORKLOG.md` append-only audit trail of all work done
- **L1 Working** — Context window (automatic, no files)
- **Auto-logging** — Hooks automatically log skill executions and detect session start/end

## Quick Start

### 1. Copy files to your project

```bash
# Commands (required)
cp -r commands/memory/ /path/to/project/.claude/commands/memory/

# Identity templates (required, customize after copying)
mkdir -p /path/to/project/.claude/identity
cp templates/SOUL.md /path/to/project/.claude/identity/SOUL.md
cp templates/USER.md /path/to/project/.claude/identity/USER.md

# Memory storage (required)
mkdir -p /path/to/project/.claude/memory/sessions
cp templates/MEMORY.md /path/to/project/.claude/memory/MEMORY.md

# Session tracking (required)
cp templates/SESSION.md /path/to/project/SESSION.md
cp templates/WORKLOG.md /path/to/project/WORKLOG.md

# Hooks (optional, enables auto-mode)
cp hooks/*.cjs /path/to/project/.claude/hooks/
```

### 2. Configure hooks (optional)

Add to your `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Skill", "hooks": [".claude/hooks/memory-auto-logging.cjs"] }
    ],
    "UserPromptSubmit": [
      { "hooks": [".claude/hooks/memory-greeting-auto-load.cjs"] },
      { "hooks": [".claude/hooks/memory-session-end-detector.cjs"] }
    ]
  }
}
```

### 3. Customize identity files

Edit `.claude/identity/SOUL.md` and replace `{project_name}` with your project name.

### 4. Use it

```bash
# Session start (auto-triggers with hooks, or explicit):
hi
continue
/memory:load

# During session:
/memory:write "Decided to use PostgreSQL"
/memory:checkpoint          # mid-session save
/memory:search "database"

# Session end:
/memory:flush
bye                         # auto-triggers with hooks
```

## Commands

| Command | Purpose |
|---------|---------|
| `/memory:load` | Load context + scan plans at session start |
| `/memory:write <entry>` | Append manual entry to WORKLOG.md |
| `/memory:search <query>` | Search across all memory layers |
| `/memory:status` | Check system health and statistics |
| `/memory:promote <item>` | Promote L2 insight to L3 core memory |
| `/memory:flush` | End session, archive state, write summary |
| `/memory:checkpoint` | Mid-session save without ending |

## File Structure (after install)

```
your-project/
├── SESSION.md              # Current phase/task progress
├── WORKLOG.md              # Append-only work history
└── .claude/
    ├── commands/memory/    # 7 slash commands
    │   ├── load.md
    │   ├── write.md
    │   ├── search.md
    │   ├── status.md
    │   ├── promote.md
    │   ├── flush.md
    │   └── checkpoint.md
    ├── identity/
    │   ├── SOUL.md         # Agent identity
    │   └── USER.md         # User preferences
    ├── memory/
    │   ├── MEMORY.md       # Project knowledge
    │   └── sessions/       # Archived session states
    └── hooks/              # Optional auto-mode
        ├── memory-greeting-auto-load.cjs
        ├── memory-auto-logging.cjs
        └── memory-session-end-detector.cjs
```

## Auto-Mode (hooks)

| Event | Hook | Action |
|-------|------|--------|
| Greeting/resume detected | `memory-greeting-auto-load.cjs` | Auto-triggers `/memory:load` |
| Skill execution | `memory-auto-logging.cjs` | Appends to WORKLOG.md |
| `/clear` or `/compact` | `memory-session-end-detector.cjs` | Auto-saves SESSION.md + WORKLOG.md |
| "bye"/"done" said | `memory-session-end-detector.cjs` | Triggers `/memory:flush` |

**Greeting patterns:** hi, hello, hey, morning, start, continue, resume, pick up, xin chao, tiep tuc

## Compatibility

- Works standalone (no external dependencies)
- Optional ClaudeKit integration (greeting hook auto-detects `ck-config-utils.cjs`)
- Tested on Windows and macOS

## License

MIT

---
name: memory-system
description: 3-layer memory model (Working, Session, Core) for Claude Code sessions. Use when starting sessions to load context, during sessions to write observations, at session end to flush/summarize, or when deciding where to store/retrieve information.
---

# Memory System

3-layer hierarchical memory with auto-logging and plan-aware context management.

## Dependencies

**Required for deployment:**

| Component | Location | Purpose |
|-----------|----------|---------|
| Commands | `.claude/commands/memory/` | User-facing slash commands |
| Identity files | `.claude/identity/` | SOUL.md, USER.md |
| Memory storage | `.claude/memory/` | MEMORY.md, daily/, sessions/ |
| Hooks (optional) | `.claude/hooks/` | Auto-logging, session detection |

## Layer Architecture

| Layer | Name | Location | Retention | Purpose |
|-------|------|----------|-----------|---------|
| L3 | Core | `identity/`, `memory/MEMORY.md` | Forever | Identity, preferences, project knowledge |
| L2 | Session | `memory/daily/`, `memory/sessions/` | Days-Weeks | Timeline, decisions, learnings |
| L1 | Working | Context window | Session only | Active reasoning, temp calculations |

## Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/memory:load` | Load context + scan plans | Session start |
| `/memory:write <entry>` | Manual log entry | Important events |
| `/memory:search <query>` | Find past info | Anytime |
| `/memory:status` | Check health | Debugging |
| `/memory:promote <item>` | L2 → L3 promotion | Confirmed patterns |
| `/memory:flush` | End session | Before closing |

## Quick Start

```bash
# Session start - any of these work:
hi                    # Auto-triggers /memory:load
morning               # Auto-triggers /memory:load
xin chào              # Auto-triggers /memory:load
bắt đầu               # Auto-triggers /memory:load
/memory:load          # Explicit command

# Manual note
/memory:write "Decided to use PostgreSQL for auth"

# End session
/memory:flush
# or just say "bye"
```

## Auto-Greeting Detection

The hook `memory-greeting-auto-load.cjs` detects greetings and auto-loads context.

**Supported patterns:**
| Language | Patterns |
|----------|----------|
| English | hi, hello, hey, morning, good morning, start, begin, let's go |
| Vietnamese | xin chào, chào, bắt đầu, khởi động |

**Excluded (won't trigger):**
- "hi, fix this bug" (contains work instruction)
- "start the server" (contains action)
- Prompts longer than 50 characters

## File Structure

```
.claude/
├── commands/memory/     # Slash commands
│   ├── load.md
│   ├── write.md
│   ├── search.md
│   ├── status.md
│   ├── promote.md
│   └── flush.md
├── identity/
│   ├── SOUL.md          # Agent identity (rare updates)
│   └── USER.md          # User preferences (3+ confirmations)
├── memory/
│   ├── MEMORY.md        # Project knowledge (proven solutions)
│   ├── daily/           # Daily logs (YYMMDD.md)
│   └── sessions/        # Session archives
├── hooks/               # Optional auto-logging
│   ├── auto-logging.cjs
│   ├── session-end-detector.cjs
│   └── session-end.cjs
└── skills/memory-system/
    └── SKILL.md         # This file
```

## Deployment Guide

### Option 1: Copy to new project

```bash
# From source project
cp -r .claude/commands/memory/ /path/to/new-project/.claude/commands/
cp -r .claude/identity/ /path/to/new-project/.claude/
cp -r .claude/memory/ /path/to/new-project/.claude/
cp -r .claude/skills/memory-system/ /path/to/new-project/.claude/skills/

# Optional: hooks for auto-logging
cp .claude/hooks/auto-logging.cjs /path/to/new-project/.claude/hooks/
cp .claude/hooks/session-end*.cjs /path/to/new-project/.claude/hooks/
```

### Option 2: Git submodule (recommended for updates)

```bash
cd /path/to/new-project
git submodule add <memory-system-repo-url> .claude/skills/memory-system

# Then symlink or copy commands
```

### Option 3: NPM package (future)

```bash
# TODO: Package as installable skill
npx claude-skill install memory-system
```

### Post-deployment checklist

- [ ] Verify `.claude/commands/memory/` exists with all 6 commands
- [ ] Create `.claude/identity/SOUL.md` with project identity
- [ ] Create `.claude/identity/USER.md` (can start empty)
- [ ] Create `.claude/memory/MEMORY.md` (can start empty)
- [ ] Create `.claude/memory/daily/` directory
- [ ] Test `/memory:load` command
- [ ] (Optional) Configure hooks in `.claude/settings.json`

### Hooks configuration (optional)

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Skill", "hooks": [".claude/hooks/auto-logging.cjs"] }
    ],
    "UserPromptSubmit": [
      { "hooks": [".claude/hooks/session-end-detector.cjs"] }
    ]
  }
}
```

## Auto-Mode (with hooks)

| Event | Hook | Action |
|-------|------|--------|
| Greeting detected | `memory-greeting-auto-load.cjs` | Trigger /memory:load |
| Skill execution | `memory-auto-logging.cjs` | Log to daily Timeline |
| "bye"/"done" said | `memory-session-end-detector.cjs` | Generate summary |

## Promotion Criteria (L2 → L3)

**Promote when:**
- Pattern repeats 3+ times across sessions
- User explicitly confirms preference
- Solution proven reusable

**Don't promote:**
- Temporary workarounds
- Session-specific decisions
- Unverified assumptions

## Daily Log Format

```markdown
# YYMMDD - {brief-theme}

## Summary
{1-2 line session summary - added at end}

## Timeline
- HH:MM | {action/event}
- HH:MM | /skill-name: {what was done}

## Decisions
- **{decision}**: {rationale}

## Learnings
- {insight for future reference}

## Next Steps
- [ ] {pending task}

## Insights to Promote
<!-- Review at session end -->
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands not found | Check `.claude/commands/memory/` exists |
| Missing memory dir | Create `.claude/memory/daily/` |
| Hooks not firing | Verify `.claude/settings.json` config |
| Stale plan data | Run `/memory:load` to refresh |

---
name: memory-system
description: 3-layer memory model (Working, Session, Core) for Claude Code sessions. Use when starting sessions to load context, during sessions to write observations, at session end to flush/summarize, or when deciding where to store/retrieve information.
---

# Memory System

3-layer hierarchical memory with session tracking, auto-logging, and plan-aware context management.

## Dependencies

**Required for deployment:**

| Component | Location | Purpose |
|-----------|----------|---------|
| Commands | `.claude/commands/memory/` | 7 user-facing slash commands |
| Identity files | `.claude/identity/` | SOUL.md, USER.md |
| Memory storage | `.claude/memory/` | MEMORY.md, sessions/ |
| Session state | `SESSION.md` (project root) | Current phase/task progress |
| Work history | `WORKLOG.md` (project root) | Append-only task audit trail |
| Hooks (optional) | `.claude/hooks/` | Auto-logging, session detection |

## Layer Architecture

| Layer | Name | Location | Retention | Purpose |
|-------|------|----------|-----------|---------|
| L3 | Core | `identity/`, `memory/MEMORY.md` | Forever | Identity, preferences, project knowledge |
| L2 | State | `SESSION.md` (project root) | Session (archived on flush) | Phase/task progress |
| L2 | History | `WORKLOG.md` (project root) | Project lifetime | Append-only task audit trail |
| L2 | Archive | `memory/sessions/` | Weeks-months | Archived session states |
| L1 | Working | Context window | Message only | Active reasoning |

## Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/memory:load` | Load context + scan plans | Session start |
| `/memory:write <entry>` | Append to WORKLOG.md | Important events |
| `/memory:search <query>` | Find past info | Anytime |
| `/memory:status` | Check health | Debugging |
| `/memory:promote <item>` | L2 → L3 promotion | Confirmed patterns |
| `/memory:flush` | End session + archive | Before closing |
| `/memory:checkpoint` | Mid-session save | Progress checkpoints |

## Quick Start

```bash
# Session start - any of these work:
hi                    # Auto-triggers /memory:load
continue              # Auto-triggers /memory:load (resume)
tiếp tục              # Auto-triggers /memory:load (Vietnamese resume)
/memory:load          # Explicit command

# Manual note
/memory:write "Decided to use PostgreSQL for auth"

# Mid-session save
/memory:checkpoint

# End session
/memory:flush
# or just say "bye"
```

## Auto-Greeting Detection

The hook `memory-greeting-auto-load.cjs` detects greetings/resume patterns and auto-loads context.

**Supported patterns:**
| Language | Patterns |
|----------|----------|
| English | hi, hello, hey, morning, good morning, start, begin, let's go |
| English (resume) | continue, resume, pick up |
| Vietnamese | xin chào, chào, bắt đầu, khởi động |
| Vietnamese (resume) | tiếp tục |

**Excluded (won't trigger):**
- "hi, fix this bug" (contains work instruction)
- "start the server" (contains action)
- "continue testing" (contains action)
- Prompts longer than 50 characters

## File Structure

```
.claude/
├── commands/memory/     # Slash commands (7 total)
│   ├── load.md
│   ├── write.md
│   ├── search.md
│   ├── status.md
│   ├── promote.md
│   ├── flush.md
│   └── checkpoint.md   # Mid-session save
├── identity/
│   ├── SOUL.md          # Agent identity (rare updates)
│   └── USER.md          # User preferences (3+ confirmations)
├── memory/
│   ├── MEMORY.md        # L3 project knowledge (proven solutions)
│   └── sessions/        # Archived session states
└── hooks/
    ├── memory-greeting-auto-load.cjs
    ├── memory-auto-logging.cjs
    └── memory-session-end-detector.cjs

PROJECT ROOT:
├── SESSION.md           # L2 current state (overwritten each checkpoint)
└── WORKLOG.md           # L2 history (append-only)
```

## SESSION.md Contract

```markdown
# SESSION — {project_name}
Updated: {YYYY-MM-DD HH:MM}

## Progress
| Phase | Status | Notes |
|-------|--------|-------|
| 1. Phase name | ✅/🔄/❌ | brief note |

## Current
- **Phase**: {N}
- **Task**: {current task}
- **Files**: {files being modified}
- **Blocked**: {blocker or none}

## Issues
- {issue description}

## Context
{1-2 lines of session context}
```

Max 30 lines. Trim old Done items if exceeded.

## WORKLOG.md Contract

```markdown
# WORKLOG — {project_name}

## {YYYY-MM-DD}

### Session {N}
- [Type] Description
- HH:MM | /skill-name: executed

--- Session ended HH:MM ---
```

Append-only. Max 500 lines (archive older entries if exceeded).

## Auto-Mode (with hooks)

| Event | Hook | Action |
|-------|------|--------|
| Greeting/resume detected | `memory-greeting-auto-load.cjs` | Trigger /memory:load |
| Skill execution | `memory-auto-logging.cjs` | Append to WORKLOG.md |
| /clear or /compact | `memory-session-end-detector.cjs` | Auto-save SESSION.md + WORKLOG.md |
| "bye"/"done" said | `memory-session-end-detector.cjs` | Trigger /memory:flush |

## Promotion Criteria (L2 → L3)

**Promote when:**
- Pattern repeats 3+ times across sessions
- User explicitly confirms preference
- Solution proven reusable

**Don't promote:**
- Temporary workarounds
- Session-specific decisions
- Unverified assumptions

## Deployment Guide

### Post-deployment checklist

- [ ] Verify `.claude/commands/memory/` exists with all 7 commands
- [ ] Create `.claude/identity/SOUL.md` with project identity
- [ ] Create `.claude/identity/USER.md` (can start empty)
- [ ] Create `.claude/memory/MEMORY.md` (can start empty)
- [ ] Create `.claude/memory/sessions/` directory
- [ ] Create `SESSION.md` at project root
- [ ] Create `WORKLOG.md` at project root
- [ ] Test `/memory:load` command
- [ ] (Optional) Configure hooks in `.claude/settings.json`

### Hooks configuration (optional)

Add to `.claude/settings.json`:

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

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Commands not found | Check `.claude/commands/memory/` exists |
| Missing SESSION.md/WORKLOG.md | Run `/memory:load` to auto-create |
| Hooks not firing | Verify `.claude/settings.json` config |
| Stale plan data | Run `/memory:load` to refresh |

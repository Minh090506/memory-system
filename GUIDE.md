# Memory System — Usage Guide

Practical workflow guide for using the memory system in your Claude Code projects.

## Daily Workflow

### Session Start

Say **"hi"**, **"continue"**, or **"tiếp tục"** — the greeting hook auto-triggers `/memory:load`.

What happens:
1. Loads L3 core: SOUL.md → USER.md → MEMORY.md
2. Reads SESSION.md (current progress) + last 20 lines of WORKLOG.md
3. Scans `plans/` for active plans
4. Outputs context summary with progress status

If no hooks installed, run `/memory:load` manually.

### During Work

**Auto-logging (passive):** Every `/skill` execution is automatically logged to WORKLOG.md by the hook.

**Manual notes:** Record important decisions or events:
```
/memory:write "Switched from REST to GraphQL for NCC API"
/memory:write "Found bug: Date objects from Sheets need instanceof check"
```

**Mid-session save:** Before long breaks or risky operations:
```
/memory:checkpoint
```
This updates SESSION.md progress table and appends unreported work to WORKLOG.md.

### Session End

Say **"bye"**, **"done"**, or **"xong"** — the hook auto-triggers flush instructions.

Or run explicitly:
```
/memory:flush
```

What happens:
1. Archives SESSION.md → `.claude/memory/sessions/session-YYMMDD-HHMM.md`
2. Appends session end marker to WORKLOG.md
3. Reviews WORKLOG for promotable insights
4. Asks: "Promote anything to MEMORY.md?"
5. Resets SESSION.md for next session

### Before /clear or /compact

The hook detects these and instructs auto-save of SESSION.md + WORKLOG.md before context is lost.

## What to Write Where

| Content | Target | How |
|---------|--------|-----|
| Quick note or decision | WORKLOG.md | `/memory:write "..."` |
| Update phase progress | SESSION.md | `/memory:checkpoint` |
| Reusable pattern (proven 3+ times) | MEMORY.md | `/memory:promote "..."` |
| User preference (confirmed) | USER.md | `/memory:promote "..."` |
| Architecture insight | MEMORY.md | `/memory:promote "..."` |

## SESSION.md — What It Tracks

```markdown
# SESSION — MyProject
Updated: 2026-02-09 15:50

## Progress
| Phase | Status | Notes |
|-------|--------|-------|
| 1. Setup database | ✅ | Schema + migrations done |
| 2. API endpoints | 🔄 | 3/5 endpoints complete |
| 3. Frontend UI | ❌ | Not started |

## Current
- **Phase**: 2
- **Task**: Implement /api/payments endpoint
- **Files**: src/routes/payments.ts, src/models/payment.ts
- **Blocked**: none

## Issues
- API rate limit hitting 429 on batch operations
```

**Rules:**
- Max 30 lines (trim old Done items if exceeded)
- Overwritten on each checkpoint/load
- Archived on flush

## WORKLOG.md — What It Tracks

```markdown
# WORKLOG — MyProject

## 2026-02-09

### Session 1
- [Init] Set up project structure
- [Decision] Using PostgreSQL over SQLite for concurrency
- 14:30 | /cook: executed
- 14:45 | /test: executed

--- Session ended 16:00 ---

## 2026-02-08

### Session 1
- [Fix] Resolved auth token expiry bug
- [Note] Redis cache TTL should be 300s not 60s
```

**Rules:**
- Append-only (never overwrite)
- Max 500 lines (archive older entries if exceeded)
- Organized by date → session

## Promotion Flow (L2 → L3)

When to promote:
- Pattern observed 3+ times across sessions
- User explicitly says "always do X"
- Solution proven reusable across features

```
/memory:promote "Date objects from Sheets: always check instanceof Date before operations"
```

This adds the insight to MEMORY.md (project knowledge) or USER.md (user preference).

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No SESSION.md found" | `/memory:load` will offer to create one |
| Hooks not firing | Check `.claude/settings.json` has hook entries |
| WORKLOG too long | `/memory:checkpoint` auto-archives at 500 lines |
| Stale progress in SESSION.md | Run `/memory:checkpoint` to refresh |
| Want to search old sessions | `/memory:search "keyword"` searches sessions/ too |

## Tips

1. **Start every session with a greeting** — context loading is the single most valuable action
2. **Write decisions, not actions** — "Chose PostgreSQL for concurrency" > "Installed PostgreSQL"
3. **Checkpoint before risky changes** — you can always recover from SESSION.md archive
4. **Promote aggressively** — if you've told Claude the same thing 3 times, promote it to MEMORY.md
5. **Keep SESSION.md lean** — it's for "where am I now", not history (that's WORKLOG's job)

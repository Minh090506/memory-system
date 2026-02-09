---
description: Check memory system health and statistics
argument-hint:
---

## Memory Status Protocol

Check health and statistics of the memory system.

### Process

1. Check L3 Core files exist:
   - `.claude/identity/SOUL.md`
   - `.claude/identity/USER.md`
   - `.claude/memory/MEMORY.md`

2. Check L2 Session files:
   - `SESSION.md` (project root) - Current phase/task progress
   - `WORKLOG.md` (project root) - Append-only history
   - `.claude/memory/sessions/` - Archived sessions

3. Count WORKLOG entries and session archives

### Output

```
[Memory] System Status

L3 Core:
  ✓ SOUL.md (agent identity)
  ✓ USER.md (user preferences)
  ✓ MEMORY.md (project knowledge)

L2 Session:
  ✓ SESSION.md — Phase {N} {status}
  ✓ WORKLOG.md ({n} entries, {m} days)
  ✓ sessions/ ({k} archives)

Hooks: ✓ greeting | ✓ auto-log | ✓ session-end

Status: Healthy
```

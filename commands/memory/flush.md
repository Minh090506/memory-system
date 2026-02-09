---
description: End session gracefully with summary
argument-hint:
---

## Memory Flush Protocol

End the current session, archive state, and write summary.

### Process

1. Read `SESSION.md` (project root)
2. Read today's entries from `WORKLOG.md`
3. Archive: copy SESSION.md → `.claude/memory/sessions/session-YYMMDD-HHMM.md`
4. Append session end marker to WORKLOG.md: `--- Session ended {timestamp} ---`
5. Review WORKLOG.md for promotable insights (patterns, decisions)
6. Ask user: "Promote anything to MEMORY.md?" → if yes, run promote flow
7. Reset SESSION.md (clear Current/Issues, keep Progress table)
8. Output summary with duration and event count

### Output

```
[Memory] Session flushed

Summary: {1-2 line summary of session}
Duration: {start time} - {end time}
Events logged: {n}

Promotion candidates found: {m}
- Run /memory:promote to review

Goodbye!
```

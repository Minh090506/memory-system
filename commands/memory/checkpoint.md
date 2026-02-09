---
description: Mid-session save of progress state
argument-hint:
---

## Memory Checkpoint Protocol

Save current session state without ending the session.

### Process
1. Update SESSION.md:
   - Refresh Progress table statuses
   - Update Current section (phase, task, files, blocked)
   - Update Issues section
   - Set Updated timestamp
2. Append unreported work to WORKLOG.md:
   - Find today's date section, create if missing
   - Append completed tasks since last checkpoint
3. Enforce SESSION.md max 30 lines (trim old Done items)
4. Enforce WORKLOG.md max 500 lines (archive if exceeded)

### Output
```
[Memory] Checkpoint saved at {HH:MM}

Progress:
| Phase | Status |
|-------|--------|
| ... current state ... |

Next: {current task}
```

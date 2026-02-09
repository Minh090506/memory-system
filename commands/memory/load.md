---
description: Load memory context and scan plans at session start
---

## Memory Load Protocol

Load the 3-layer memory system context for this session.

### Step 1: Load L3 Core Memory

Read these files in order:
1. `.claude/identity/SOUL.md` - Agent identity and directives
2. `.claude/identity/USER.md` - User preferences and patterns
3. `.claude/memory/MEMORY.md` - Project knowledge and solutions

### Step 2: Load L2 Session State

Read session tracking files:
1. `SESSION.md` (project root) - Current phase/task progress
2. `WORKLOG.md` (project root) - Recent entries (last 20 lines only)

If SESSION.md doesn't exist, offer to initialize:
- Ask: "No SESSION.md found. Initialize session tracker? Project name and phases?"
- Or auto-detect phases from active plan in `plans/`
- Create SESSION.md + WORKLOG.md from templates

### Step 3: Scan Active Plans

Scan `plans/` folder for active plans:
- Parse `plan.md` files for status
- Calculate progress from checkboxes `[x]` vs `[ ]`
- Identify current task (first unchecked item)

### Step 4: Generate Context Summary

Output a summary in this format:

```
[Memory] Context loaded

Core: SOUL (agent), USER (preferences), MEMORY (project)
Session: Phase {N} {status} — Next: {task}
{If issues}: ⚠️ {count} issues from last session

[Plan] {plan-name} ({progress}%)
  Current: {current-task}

Ready. What would you like to work on?
```

## Important

- Read all memory files before responding
- If files are missing, note them but continue
- Prioritize recent context over older entries

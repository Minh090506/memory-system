---
description: Write manual entry to WORKLOG
argument-hint: <entry>
---

## Memory Write Protocol

Write a manual entry to the project WORKLOG.

### Input
Entry text: `$ARGUMENTS`

### Process

1. Open `WORKLOG.md` at project root
2. If file doesn't exist, create with header: `# WORKLOG — {project_name}`
3. Find today's date section `## {YYYY-MM-DD}`, create if missing
4. Append entry: `- [Note] $ARGUMENTS`
5. Confirm: `[Memory] Entry added to WORKLOG.md`

### Output

Confirm entry was written:
```
[Memory] Entry added to WORKLOG.md
```

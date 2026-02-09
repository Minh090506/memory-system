---
description: Promote insights from L2 session to L3 core memory
argument-hint: <item>
---

## Memory Promote Protocol

Promote confirmed patterns from L2 (session) to L3 (core) memory.

### Input
Item to promote: `$ARGUMENTS`

### Promotion Criteria

Promote to L3 when:
- Pattern repeats 3+ times across sessions
- User explicitly confirms preference
- Solution proven reusable
- Information unlikely to change

### Target Files

| Content Type | Target |
|--------------|--------|
| User preference | `.claude/identity/USER.md` |
| Reusable solution | `.claude/memory/MEMORY.md` |
| Work pattern | `.claude/identity/USER.md` |

### Process

1. Validate item meets promotion criteria
2. Determine appropriate L3 target file
3. Add entry to relevant section
4. Remove from L2 "Insights to Promote" section

### Output

```
[Memory] Promoted to L3

Item: {item description}
Target: USER.md / MEMORY.md
Section: {section name}

Entry added successfully.
```

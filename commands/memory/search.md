---
description: Search past information in memory system
argument-hint: <query>
---

## Memory Search Protocol

Search for information across the memory system layers.

### Input
Search query: `$ARGUMENTS`

### Search Priority

| Query Type | Search Order |
|------------|--------------|
| "progress" / "tiến độ" | SESSION.md → WORKLOG.md |
| "yesterday" / "hôm qua" | WORKLOG.md → sessions/ |
| "user prefer" / "preferences" | L3 USER.md → WORKLOG.md |
| "project" / "architecture" | L3 MEMORY.md → WORKLOG.md |
| "plan" / "progress" | plans/ → SESSION.md |
| General query | L3 → WORKLOG.md → sessions/ |

### Process

1. Analyze query intent
2. Search relevant files using Grep
3. Return matching entries with context

### Output

```
[Memory Search] "$ARGUMENTS"

Found in L3 MEMORY.md:
  - {matching content}

Found in WORKLOG.md:
  - {matching content}

{n} results found
```

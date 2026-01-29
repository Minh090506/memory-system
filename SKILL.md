---
name: memory-system
description: 3-layer memory model (Working, Session, Core) for Claude Code sessions. Use when starting sessions to load context, during sessions to write observations, at session end to flush/summarize, or when deciding where to store/retrieve information.
---

# Memory System

3-layer hierarchical memory with auto-logging and plan-aware context management.

## Layer Architecture

| Layer | Name | Location | Retention | Purpose |
|-------|------|----------|-----------|---------|
| L3 | Core | `identity/`, `memory/MEMORY.md` | Forever | Identity, preferences, project knowledge |
| L2 | Session | `memory/daily/`, `memory/sessions/` | Days-Weeks | Timeline, decisions, learnings |
| L1 | Working | Context window | Session only | Active reasoning, temp calculations |

### L3 Core Files

| File | Content | Update Frequency |
|------|---------|------------------|
| `identity/SOUL.md` | Agent identity, core directives | Rare |
| `identity/USER.md` | User preferences, work patterns | When confirmed (3+ occurrences) |
| `memory/MEMORY.md` | Project knowledge, proven solutions | When proven reusable |

### L2 Session Files

| File | Format | Purpose |
|------|--------|---------|
| `memory/daily/YYMMDD.md` | Daily log | Timeline, decisions, learnings |
| `memory/sessions/*.md` | Session archive | Long/complex session records |

## Auto-Mode (Default)

Memory system operates automatically via hooks:

| Event | Hook | Action |
|-------|------|--------|
| Session start | `session-init.cjs` | Environment setup |
| Skill execution | `auto-logging.cjs` | Log to daily Timeline |
| "bye"/"done" said | `session-end-detector.cjs` | Generate summary, end marker |
| Session end | `session-end.cjs` | Cleanup, final log entry |

**User actions needed:**
1. `/memory-load` at session start (optional but recommended)
2. Say "bye" or "done" to end gracefully

## Plan-Aware Features

### Plan Scanning

On `/memory-load`, scan `plans/` folder for active plans:

```
plans/
├── 260128-auth-module/
│   ├── plan.md              # Overview (parse status)
│   └── phase-01-setup.md    # Phase details (parse checkboxes)
└── 260129-memory-hooks/
    └── plan.md
```

### Progress Calculation

Parse markdown checkboxes in plan files:

```markdown
## Tasks
- [x] Create hook file        ← completed
- [x] Register in settings    ← completed
- [ ] Test with real input    ← CURRENT (first unchecked)
- [ ] Update documentation    ← pending
```

**Formula**: `completion = checked / total × 100`

### Smart Suggestions

Based on plan structure, suggest next action:

```
[Plan] 260129-memory-hooks (75% complete)
  ✓ Phase 1: Setup (done)
  ✓ Phase 2: Implementation (done)
  → Phase 3: Testing (in progress)
    Current: Test with real input
  ○ Phase 4: Documentation (pending)

Suggested: Run tests for auto-logging hook
```

### Plan Status Detection

| Marker | Status |
|--------|--------|
| `[x]` or `✓` | Completed |
| `[ ]` or `○` | Pending |
| `→` or `►` | In Progress |
| First unchecked | Current Task |

## Commands Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/memory-load` | Load context + scan plans | Session start |
| `/memory-search <query>` | Find past info | Anytime |
| `/memory-status` | Check health | Debugging |
| `/memory-init` | First time setup | New project |
| `/memory-write <entry>` | Manual log entry | Important events |
| `/memory-promote <item>` | L2 → L3 promotion | Confirmed patterns |
| `/memory-flush` | End session | Before closing |

## Bootstrap Protocol

### Session Start (`/memory-load`)

1. **Load L3 Core**
   ```
   identity/SOUL.md → identity/USER.md → memory/MEMORY.md
   ```

2. **Load L2 Session**
   ```
   memory/daily/YYMMDD.md (today)
   memory/daily/YYMMDD-1.md (yesterday, if referenced)
   ```

3. **Scan Plans**
   ```
   plans/**/plan.md → parse status
   Identify: active plan, current phase, next task
   ```

4. **Generate Summary**
   ```
   [Memory] Context loaded

   Core: SOUL (agent), USER (preferences), MEMORY (project)
   Today: 5 events logged, 2 pending tasks

   [Plan] 260129-memory-hooks (50% → 75%)
     Current: Implement session-end hook
     Next: Test auto-logging

   Ready. What would you like to work on?
   ```

## Write Protocol

| Content | Target | Trigger |
|---------|--------|---------|
| Skill execution | L2 daily Timeline | Auto (hook) |
| Decisions | L2 daily Decisions | Manual or explicit |
| User preference (3+) | L3 USER.md | `/memory-promote` |
| Reusable solution | L3 MEMORY.md | `/memory-promote` |
| Session summary | L2 daily Summary | Auto (session end) |

## Search Priority

| Query Type | Search Order |
|------------|--------------|
| "What did I do yesterday?" | L2 daily → L2 sessions |
| "How does user prefer X?" | L3 USER.md → L2 |
| "Project structure?" | L3 MEMORY.md → L2 |
| "Current plan progress?" | plans/ folder → L2 |

## Promotion Criteria (L2 → L3)

Promote to L3 when:
- Pattern repeats 3+ times across sessions
- User explicitly confirms preference
- Solution proven reusable
- Information unlikely to change

**Anti-patterns (don't promote):**
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
- HH:MM | Session ended

## Decisions

- **{decision}**: {rationale}

## Learnings

- {insight for future reference}

## Next Steps

- [ ] {pending task}
- [x] {completed task}

## Insights to Promote

<!-- Review at session end -->
- prefer: {user preference candidate}
- solution: {reusable pattern candidate}
```

## File Structure

```
.claude/
├── identity/
│   ├── SOUL.md         # Agent identity
│   └── USER.md         # User preferences
├── memory/
│   ├── MEMORY.md       # Project knowledge
│   ├── daily/          # Daily logs (YYMMDD.md)
│   └── sessions/       # Session archives
└── hooks/
    ├── auto-logging.cjs         # PostToolUse → daily log
    ├── session-end-detector.cjs # UserPromptSubmit → detect "bye"
    └── session-end.cjs          # SessionEnd → cleanup

plans/
├── {date}-{slug}/
│   ├── plan.md          # Overview with status
│   └── phase-XX-*.md    # Phase details
└── reports/             # Agent reports
```

## Quick Start

```bash
# First time setup
/memory-init

# Every session start
/memory-load

# End session (just say)
bye
```

## Integration with Hooks

The memory system integrates with Claude Code hooks:

| Hook | File | Trigger | Action |
|------|------|---------|--------|
| PostToolUse | auto-logging.cjs | Skill completes | Log to Timeline |
| UserPromptSubmit | session-end-detector.cjs | "bye"/"done" | Summary + end marker |
| SessionEnd | session-end.cjs | Session closes | Cleanup + final entry |

## Error Recovery

| Issue | Solution |
|-------|----------|
| Missing memory dir | Run `/memory-init` |
| Corrupt daily log | Check Timeline section markers |
| Stale plan data | Run `/memory-load` to refresh |
| Hook not firing | Check `.claude/settings.json` |

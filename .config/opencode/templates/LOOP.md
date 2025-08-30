# Iterative Implementation Loop Instructions for {{PROJECT_NAME}}

## Context Management Rules

- **STOP WORKING at 50% context usage** to preserve quality
- Check context with periodic self-assessment
- If approaching limit, finalize current work and update status

## Session Structure

### 1. START: Understand Current State

First, check the git history and read the current status:

```bash
git log --oneline -5
```

Then read the current implementation status:

```bash
cat {{STATUS_FILE_PATH}}
```

If {{STATUS_FILE_PATH}} doesn't exist, initialize it with:

```
# Implementation Status

## Current Phase
{{INITIAL_PHASE}}

## Current Session
Session 1: {{INITIAL_SESSION_NAME}}

## Completed Sessions
None

## Next Steps
{{INITIAL_NEXT_STEPS}}

## Notes
{{INITIAL_NOTES}}
```

### 2. EXECUTE: Perform Current Session Work

Based on the current session indicated in {{STATUS_FILE_PATH}}, execute the appropriate work:

#### Session Pattern (5-session cycle per feature):

1. **SPECIFY** - Use @task with requirements-analyst to define requirements
2. **DESIGN** - Use @task with system-architect to design architecture
3. **IMPLEMENT** - Use @task with developer to write code
4. **VALIDATE** - Use @task with qa-engineer to test
5. **OPTIMIZE** - Use @task with maintenance-support to optimize

#### Anti-Oversimplification Requirements

**CRITICAL**: Do NOT implement binary on/off controls. Instead:

- Use continuous intensity scales (0.0 to 1.0)
- Preserve system coherence above 0.8
- Test enhancement DELTAS not absolute states
- Compare against realistic baselines{{BASELINE_EXAMPLES}}
- Implement layered enhancements that ADD to baseline

#### Implementation Priorities

{{IMPLEMENTATION_PRIORITIES}}

#### Code Location Structure

```
{{CODE_STRUCTURE}}
```

### 3. WORK: Implementation Guidelines

Use @sentient-agi-reasoning to help plan the session work. Follow these patterns:

```{{CODE_LANGUAGE}}
{{CODE_PATTERNS}}
```

### 4. TEST: Validation Requirements

For each implementation:

{{VALIDATION_REQUIREMENTS}}

### 5. FINISH: Update Status and Commit

Before ending the session:

1. Update {{STATUS_FILE_PATH}} with:
   - Work completed in this session
   - Current phase and session number
   - Next session's objectives
   - Any blockers or issues
   - Context usage estimate

2. Example status update:

```markdown
# Implementation Status

## Current Phase

{{EXAMPLE_PHASE}}

## Current Session

{{EXAMPLE_SESSION}}

## Completed Sessions

{{EXAMPLE_COMPLETED}}

## Next Steps

{{EXAMPLE_NEXT_STEPS}}

## Blockers

{{EXAMPLE_BLOCKERS}}

## Context Usage

{{EXAMPLE_CONTEXT_USAGE}}

## Notes

{{EXAMPLE_NOTES}}
```

3. Commit your work:

```bash
git add -A
git commit -m "{{COMMIT_PREFIX}}: implement [specific feature] for session N

- Add [specific functionality]
- Include [specific tests]
- Document [specific aspects]

{{COMMIT_SUFFIX}}"
```

### 6. EXIT: Context Preservation

If context usage exceeds 50%:

1. Stop immediately
2. Document stopping point in {{STATUS_FILE_PATH}}
3. Note any partial work that needs completion
4. Commit all changes
5. Exit the session

## Session Phases Overview

{{PHASES_OVERVIEW}}

## Remember

- This file is STATELESS - all state tracking happens in {{STATUS_FILE_PATH}}
- Stop at 50% context to maintain quality
- {{ADDITIONAL_REMINDERS}}
- Commit frequently with descriptive messages
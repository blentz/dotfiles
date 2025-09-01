# Iterative Implementation Loop Instructions for {{PROJECT_NAME}}

## READ-ONLY LOOP.md
This file is READ-ONLY. DO NOT MODIFY LOOP.md.

## Core Project Files (READ FIRST EVERY LOOP)
- {{PRP_document}}

## Context Management Rules

- **STOP WORKING at 50% context usage** to preserve quality
- Check context with periodic self-assessment
- If approaching limit, finalize current work and update status

## Session Structure

### 0. PREPARE: Scan the previous session's work for bullshit. REQUIRED FOR EVERY LOOP.

Use the bullshit-detector sub-agent to assess whether the previous itration did usable work. Do not move to a new phase of the project until the current phase is correctly implemented.

### 1. START: Understand Current State

First, read the core project files, then check the git history and read the current status:

```bash
git log --oneline -5
git log --stat -p HEAD
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
Permission to simplify problems is **DENIED**. The user must give you explicit approval before you are allowed to avoid complex problems.

**CRITICAL**: You do not have permission to:
- implement "simple" solutions
- create "demo" or "demonstration" code
- create "simple" tests or validations
- create new "clean" versions of anything. Two nonfunctional versions is two failures. Fix what's here, don't create double the mess.
- use "realistic" data. Realistic is fake, not real.
- create "mock" implmentations. Mocking is only valid in unit tests.
- using alternative approaches not in the PRP
- change goals or redefine success. The only valid definition of success is the one the user gave.
- using random functions of any kind. Using Math.random() is ALWAYS a failure. Every time you use Math.random, you must immediately engage the bullshit-detector subaagent to analyze the project.

Remember: Partially implemented solutions that can be iterated upon in a future iteration loop are ALLOWED. Incomplete high complexity work is always better than arriving at a wrong answer quickly. Fast solutions are always failures. Take as many iterations as neceassary to complete the task correctly.

### When a problem is too complex ALWAYS do this instead of simplifying:
  1. Immediately stop implementing and return to planning.
  2. Break down the complex problem into smaller tasks.
  3. Recursively plan and break complex problems down until tasks are simple enough for you to solve correctly within the context window.
  4. Use the docs/PHOENIX_STATUS.md to document your task breakdowns and progress at implementation.

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

1. Remove status from sessions older than the last 5 iterations unless the information is still relevant.
2. Update {{STATUS_FILE_PATH}} with:
   - Work completed in this session
   - Current phase and session number
   - Next session's objectives
   - Any blockers or issues
   - Context usage estimate

3. Example status update:

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

4. Commit your work:

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

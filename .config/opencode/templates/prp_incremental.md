name: "Incremental PRP Template"
description: |

## Purpose
Template optimized for AI agents to implement features incrementally through continuous execution loops, with anti-oversimplification guardrails and strict validation requirements to achieve working code through iterative atomic progress.

## Core Principles
1. **Atomic Progress**: Each iteration completes ONE verifiable task
2. **Evidence Required**: No progress without test execution proof
3. **State Persistence**: Track progress between iterations in .state/
4. **Anti-Masturbation**: No self-congratulation without concrete results
5. **Validation First**: Test before declaring completion
6. **Global rules**: Follow all rules in CLAUDE.md
7. **Use Subagents**: Leverage the Task tool with appropriate subagent_type for complex operations

## LOOP.md Generation Instructions

When using `generate-prp` with this template, TWO files will be created:
1. The PRP document (this filled template)
2. A LOOP.md file based on the template at: `.config/opencode/templates/LOOP.md`

### LOOP.md Template Variables to Fill

When generating LOOP.md, populate these placeholders based on your project:

```yaml
PROJECT_NAME: "[Your project/feature name]"
STATUS_FILE_PATH: "docs/CURRENT_STATUS.md"  # Or your preferred location
INITIAL_PHASE: "Phase 1: [Your first phase name]"
INITIAL_SESSION_NAME: "[Your first session description]"
INITIAL_NEXT_STEPS: |
  - [First task]
  - [Second task]
  - [Third task]
INITIAL_NOTES: "Starting implementation of [feature description]"

# Optional baseline examples (leave blank if not applicable)
BASELINE_EXAMPLES: " (GPT-4, Claude, human)"  # Or empty string

IMPLEMENTATION_PRIORITIES: |
  1. [Your priority 1]
  2. [Your priority 2]
  3. [Your priority 3]
  4. [Your priority 4]
  5. [Your priority 5]

CODE_STRUCTURE: |
  src/
  ├── [your structure here]
  └── ...

CODE_LANGUAGE: "typescript"  # or python, javascript, etc.

CODE_PATTERNS: |
  // Your language-specific patterns
  // Include proper typing, error handling, etc.

VALIDATION_REQUIREMENTS: |
  1. [Your validation step 1]
  2. [Your validation step 2]
  3. [Your validation step 3]
  4. [Your validation step 4]
  5. [Your validation step 5]

# Example values for status updates
EXAMPLE_PHASE: "Phase 1: [Example phase]"
EXAMPLE_SESSION: "Session 2: [Example session]"
EXAMPLE_COMPLETED: |
  - Session 1: [What was completed]
    - [Specific item 1]
    - [Specific item 2]
EXAMPLE_NEXT_STEPS: |
  - [Next task 1]
  - [Next task 2]
  - [Next task 3]
EXAMPLE_BLOCKERS: "None"  # Or specific blockers
EXAMPLE_CONTEXT_USAGE: "Approximately 45% - stopping work to preserve quality"
EXAMPLE_NOTES: |
  - [Note about validation]
  - [Note about implementation]
  - [Note about next steps]

COMMIT_PREFIX: "feat(component)"  # Or fix, docs, test, etc.
COMMIT_SUFFIX: "Part of [project name] implementation"

PHASES_OVERVIEW: |
  ### Phase 1: [Phase Name] (Sessions 1-N)
  - [Goal 1]
  - [Goal 2]

  ### Phase 2: [Phase Name] (Sessions N-M)
  - [Goal 1]
  - [Goal 2]

  ### Phase 3: [Phase Name] (Sessions M-P)
  - [Goal 1]
  - [Goal 2]

ADDITIONAL_REMINDERS: |
  - [Project-specific reminder 1]
  - [Project-specific reminder 2]
  - Use established libraries, don't reinvent the wheel
```

### Generated LOOP.md Usage

The generated LOOP.md file will:
- Reference this PRP document for detailed requirements
- Provide session-by-session execution instructions
- Track progress in the specified status file
- Enforce iteration discipline with anti-oversimplification guardrails
- Guide incremental atomic progress through the implementation

---

## Goal
[What needs to be built - be specific about the end state and desires]

## Why
- [Business value and user impact]
- [Integration with existing features]
- [Problems this solves and for whom]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcomes]

## Iteration State Management

### State Directory Structure
```bash
.state/
├── current_task.txt          # ID of task in progress
├── completed_tasks.txt       # List of completed task IDs
├── iteration_count.txt       # Current iteration number
├── task_manifest.yaml        # Complete task list with status
└── iteration_[N].log         # Log for each iteration
```

### Task Manifest Format
```yaml
tasks:
  - id: "task_001"
    description: "Create data models"
    status: "pending|in_progress|completed|blocked"
    validation_passed: false
    test_output: ""
    completed_at: ""
    blocked_reason: ""

  - id: "task_002"
    description: "Implement API endpoint"
    depends_on: ["task_001"]
    status: "pending"
    validation_passed: false
```

## All Needed Context

### Documentation & References (list all context needed to implement the feature)
```yaml
# MUST READ - Include these in your context window
- url: [Official API docs URL]
  why: [Specific sections/methods you'll need]

- file: [path/to/example.py]
  why: [Pattern to follow, gotchas to avoid]

- doc: [Library documentation URL]
  section: [Specific section about common pitfalls]
  critical: [Key insight that prevents common errors]

- docfile: [PRPs/ai_docs/file.md]
  why: [docs that the user has pasted in to the project]
```

### Current Codebase tree (run `tree` in the root of the project)
```bash

```

### Desired Codebase tree with files to be added
```bash

```

### Known Gotchas & Library Quirks
```python
# CRITICAL: [Library name] requires [specific setup]
# Example: FastAPI requires async functions for endpoints
# Example: This ORM doesn't support batch inserts over 1000 records
```

## Implementation Blueprint

### Data models and structure
```python
# Examples:
#  - orm models
#  - pydantic models
#  - pydantic schemas
#  - pydantic validators
```

### Atomic Task List (ONE per iteration)

```yaml
Task 001:
  id: "task_001"
  description: "Create base data model"
  atomic_scope: |
    - CREATE src/models/feature.py
    - Define single model class
    - Add type hints
    - NO additional features
  validation_required:
    - "mypy src/models/feature.py"
    - "python -c 'from src.models.feature import Model'"
  estimated_time: "5 minutes"

Task 002:
  id: "task_002"
  description: "Add model validation"
  depends_on: ["task_001"]
  atomic_scope: |
    - MODIFY src/models/feature.py
    - Add validators to existing model
    - Test validation logic
  validation_required:
    - "pytest tests/test_model_validation.py"
    - "mypy src/models/feature.py"

# Complex tasks requiring subagents:
Task N (Complex):
  id: "task_complex"
  description: "Design complex integration"
  use_subagent: "system-architect"
  prompt: "Design integration between feature X and Y"

Task N+1 (QA):
  id: "task_qa"
  description: "Comprehensive testing"
  use_subagent: "qa-engineer"
  prompt: "Create and execute comprehensive test suite for feature"

# Continue with atomic, testable tasks...
```

### Per-Task Implementation Guide
```python
# Task 001: Create base data model
# ATOMIC: Only create the model, nothing else
from sqlalchemy import Column, String, Integer
from database import Base

class Feature(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    # STOP HERE - validation in next iteration

# Task 002: Add validation (NEXT ITERATION)
# Will add pydantic schema and validators
```

## Iteration Validation Protocol

### Pre-Iteration Checks
```bash
# Verify state consistency
cat .state/current_task.txt
cat .state/iteration_count.txt

# Ensure clean working directory
git status
```

### During Iteration Validation
```bash
# Level 1: Immediate Syntax Check (after EVERY file change)
python -m py_compile src/new_file.py

# Level 2: Type Check (after syntax passes)
mypy src/new_file.py --strict

# Level 3: Import Test (after type check passes)
python -c "from src.new_file import ClassName"
```

### Post-Task Validation (REQUIRED before marking complete)
```bash
# Run specific task tests
pytest tests/test_[task_id].py -v --tb=short

# If test fails, DO NOT proceed - fix the code
# If test passes, update state:
echo "task_[ID]" >> .state/completed_tasks.txt
```

### Iteration Exit Criteria
```yaml
PASS:
  - All validation commands execute successfully
  - Test output shows PASSED status
  - No import errors
  - No type errors
  - State files updated

FAIL:
  - Fix errors in current iteration
  - Do NOT move to next task
  - Do NOT declare partial success
  - Log specific error for debugging
```

## Anti-Pattern Detection

### Red Flags (STOP if you're doing these)
```python
# ❌ WRONG: Placeholder implementation
def complex_function():
    pass  # TODO: implement later

# ✅ RIGHT: Functional implementation
def complex_function():
    # Actual working code, even if simple
    return process_data(input_data)

# ❌ WRONG: Untested success claim
print("Feature implemented successfully!")

# ❌ WRONG: Untested success claim
console.log("Test passed successfully!")

# ❌ WRONG: Untested success claim
echo "Validated successfully!")

# ✅ RIGHT: Evidence-based completion
# Show actual test output:
# tests/test_feature.py::test_basic PASSED

# ❌ WRONG: Skipping validation
# "Tests would pass if we ran them"

# ✅ RIGHT: Always run validation
subprocess.run(["pytest", "tests/"], check=True)

# ❌ WRONG: Faking results with random()
test_data = hardcoded_constant * Math.random()

# ✅ RIGHT: Always use real data from remote APIs
test_data = remote_api_call()

# ✅ RIGHT: Always use real data from databases.
test_data = fetch_data_from_database()

```

### Oversimplification Triggers
- Replacing error handling with generic try/except
- Using print() instead of proper logging
- Hardcoding values that should be configurable
- Removing functionality to "simplify"
- Creating mock objects instead of real implementations
- Using random() instead of real data
- Doing anything "for now"
- Changing goals to something the user did not explicitly request.

## Final Validation Checklist (Per Iteration)
- [ ] Current task test passes: `pytest tests/test_[task_id].py`
- [ ] No syntax errors: `python -m py_compile [file]`
- [ ] No type errors: `mypy [file]`
- [ ] No import errors: `python -c "import [module]"`
- [ ] State files updated: `.state/` reflects progress
- [ ] No placeholder code remains
- [ ] No untested code paths
- [ ] No randomized fake data
- [ ] No hardcoded fake data

## Emergency Stop Conditions
If ANY of these occur, STOP and ask for user intervention:
1. Test failures after 3 fix attempts
2. Circular dependency detected
3. Breaking changes to existing functionality
4. Security vulnerability introduced
5. Performance regression > 50%

---

## Continuous Execution Command

Run this in your terminal:
```bash
# Initialize state
mkdir -p .state
echo "task_001" > .state/current_task.txt
echo "0" > .state/iteration_count.txt

# Run continuous loop with developer subagent
while true; do
  opencode -m {MODEL_ID} run "Use Task tool with subagent_type='developer' to execute: $(cat LOOP.md)"
  sleep 60
done
```

## Success Metrics
- Iterations with test failures: 0
- Placeholder code instances: 0
- Untested code paths: 0
- State consistency errors: 0
- Oversimplification occurrences: 0

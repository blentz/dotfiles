---
description: Execute Product Requirements Prompt
---
# Execute PRP

## IMPORTANT: Use the Developer Subagent

**You MUST use the Task tool to launch the developer subagent for this command:**
```
Task(
  description="Execute PRP",
  prompt="<include the full contents of this command and the PRP file>",
  subagent_type="developer"
)
```

Implement a feature using the PRP file.

## PRP File: $ARGUMENTS

## Execution Process

1. **Load PRP**
   - Read the specified PRP file
   - Understand all context and requirements
   - Follow all instructions in the PRP and extend the research if needed
   - Ensure you have all needed context to implement the PRP fully
   - Do more web searches and codebase exploration as needed

2. **THINK**
   - Think hard using @sentient-agi-reasoning before you execute the plan.
   - Create a comprehensive plan addressing all requirements.
   - Break down complex tasks into smaller, manageable steps using your todos tools.
   - Use the TodoWrite tool to create and track your implementation plan.
   - Identify implementation patterns from existing code to follow.

3. **Execute the plan**
   - Execute the PRP
   - Implement all the code
   - For complex subtasks, consider using specialized subagents:
     - `subagent_type="maintenance-support"` for bug fixes
     - `subagent_type="devops-engineer"` for CI/CD or infrastructure
     - `subagent_type="qa-engineer"` for comprehensive testing

4. **Validate**
   - Run each validation command
   - Fix any failures
   - Re-run until all pass with 0 errors, 0 warnings, 0 skipped
   - Carefully check logs and command outputs for errors or unexpected behavior
   - Consider using `subagent_type="qa-engineer"` for thorough validation

5. **Complete**
   - Ensure all checklist items done
   - Run final validation suite
   - Report completion status
   - Read the PRP again to ensure you have implemented everything

6. **Reference the PRP**
   - You can always reference the PRP again if needed

Note: If validation fails, use error patterns in PRP to fix and retry.

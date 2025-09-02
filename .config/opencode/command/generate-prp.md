---
description: Create a Product Requirements Prompt
---

# Create Product Requirements Prompt (PRP)

## IMPORTANT: Use the Project Manager Subagent

**You MUST use the Task tool to launch the project-manager subagent for this command:**
```
Task(
  description="Generate PRP",
  prompt="<include the full contents of this command>",
  subagent_type="project-manager"
)
```

## Feature file: $ARGUMENTS

Generate a complete PRP for general feature implementation with thorough research. Ensure context is passed to the AI agent to enable self-validation and iterative refinement. Read the feature file first to understand what needs to be created, how the examples provided help, and any other considerations.

The AI agent only gets the context you are appending to the PRP and training data. Assume the AI agent has access to the codebase and the same knowledge cutoff as you, so its important that your research findings are included or referenced in the PRP. The Agent has Websearch capabilities, so pass urls to documentation and examples. The AI agent has access to the mcp__sentient-agi-reasoning MCP server for enhanced reasoning capabilities and should be encouraged to use it for all reasoning tasks.

## Using Subagents for Research

For complex research tasks, use appropriate subagents:
- Use `subagent_type="general"` for broad research and exploration
- Use `subagent_type="requirements-analyst"` for requirement analysis
- Use `subagent_type="system-architect"` for architectural planning

## Research Process

1. **Codebase Analysis**
   - Search for similar features/patterns in the codebase
   - Identify files to reference in PRP
   - Note existing conventions to follow
   - Check test patterns for validation approach

2. **External Research**
   - Search for similar features/patterns online
   - Library documentation (include specific URLs)
   - Implementation examples (GitHub/StackOverflow/blogs)
   - Best practices and common pitfalls

3. **User Clarification** (if needed)
   - Specific patterns to mirror and where to find them?
   - Integration requirements and where to find them?

## PRP Generation

### Template Selection (EXPLICIT RULES)

templates_dir: `.opencode/templates/`

**SELECT TEMPLATE BASED ON USER INPUT:**
1. IF user input contains "incremental" OR "in a loop" OR "continuous" OR "iterative":
   - USE: `{templates_dir}/prp_incremental.md`
   - USE: `{templates_dir}/LOOP.md`
2. ELSE (default case):
   - USE: `{templates_dir}/prp_base.md`

**IMPORTANT:** Check the exact user input in $ARGUMENTS to determine template selection.

### Critical Context to Include and pass to the AI agent as part of the PRP
- **Documentation**: URLs with specific sections
- **Code Examples**: Real snippets from codebase
- **Gotchas**: Library quirks, version issues
- **Patterns**: Existing approaches to follow

### Implementation Blueprint
- Start with pseudocode showing approach
- Reference real files for patterns
- Include error handling strategy
- list tasks to be completed to fullfill the PRP in the order they should be completed

### Validation Gates (Must be Executable) e.g. for python
```bash
# Syntax/Style
ruff check --fix && mypy .

# Unit Tests
uv run pytest tests/ -v

```

*** CRITICAL AFTER YOU ARE DONE RESEARCHING AND EXPLORING THE CODEBASE BEFORE YOU START WRITING THE PRP ***

*** THINK ABOUT THE PRP AND PLAN YOUR APPROACH USING mcp__sentient-agi-reasoning THEN START WRITING THE PRP ***

## Output
Save as: `docs/PRP_{feature-name}.md`

## Quality Checklist
- [ ] All necessary context included
- [ ] Validation gates are executable by AI
- [ ] References existing patterns
- [ ] Clear implementation path
- [ ] Error handling documented

Score the PRP on a scale of 1-10 (confidence level to succeed in one-pass implementation using an AI coding assistant)

## CRITICAL: Bullshit Detector Review

**MANDATORY STEP - DO NOT SKIP**

After completing the PRP, you MUST submit it for bullshit-detector review:

```
Task(
  description="Review PRP for bullshit",
  prompt="Review the following PRP and identify any bullshit, oversimplifications, or AI-generated slop. Block if not production-ready: [Include full PRP content]",
  subagent_type="bullshit-detector"
)
```

The bullshit-detector will check for:
- Vague or meaningless requirements
- Over-engineered or toy example solutions
- Missing critical implementation details
- Unrealistic validation criteria
- AI-generated generic content
- Lack of error handling specifications
- Cherry-picked or fabricated metrics

**If the bullshit-detector rejects the PRP:**
1. Address ALL identified issues
2. Rewrite problematic sections
3. Submit for re-review
4. DO NOT proceed until approved

Remember: The goal is fully working implementation success through comprehensive context - no bullshit allowed.

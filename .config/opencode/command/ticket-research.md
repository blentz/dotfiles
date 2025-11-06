---
agent: requirements-analyst
allowed-tools: Read, Write, WebFetch
description: "Research a Linear ticket and create a detailed analysis plan (usage\\: /ticket-research TICKET-123)"
---

# Ticket Research

Research a Linear ticket comprehensively and document findings in a structured plan.

## Instructions

1. **Retrieve Ticket Information**
   - Use the Linear tool to read the ticket details for: $1
   - Extract key information: title, description, status, labels, comments, and related context

2. **Research the Issue**
   - Conduct web searches to research the problem domain
   - **Prioritization**: Prefer primary sources in this order:
     1. Official tool/vendor documentation
     2. GitHub repositories and source code
     3. OpenAPI specs and technical specifications
     4. Only use third-party sources (blogs, Stack Overflow) as supplementary information
   - Identify relevant technologies, frameworks, or APIs involved
   - Look for known issues, bugs, or feature requests in upstream projects

3. **Analysis**
   - Synthesize findings from the ticket and web research
   - Identify potential approaches or solutions
   - Note any edge cases, constraints, or dependencies
   - Document assumptions that need validation

4. **Create Plan Document**
   - Write a comprehensive plan to: `$1-plan.md`
   - Include the following sections:
     - **Ticket Summary**: Key details from Linear
     - **Research Findings**: Information gathered from documentation and sources
     - **Technical Analysis**: Deep dive into the problem domain
     - **Proposed Approaches**: Multiple options with trade-offs
     - **Open Questions**: Items requiring clarification
     - **Next Steps**: Recommended actions
     - **References**: Links to all sources consulted
   - NEVER include:
     - time estimates
     - cost estimates
     - deadlines or due-dates
     - past-tense or future-tense wording related to document revisions
     - document revision information

## Context

- Linear workspace access via Linear tools
- Web search via WebFetch tool for documentation research

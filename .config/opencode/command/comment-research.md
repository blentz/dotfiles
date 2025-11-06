---
agent: documentation-synchronizer
allowed-tools: Read
description: "Add research plan as a comment to a Linear ticket (usage\\: /comment-research TICKET-123)"
---

# Comment Research

Add the contents of a research plan document as a comment to the specified Linear ticket.

## Instructions

1. **Read the Research Plan**
   - Read the file: `$1-plan.md`
   - Verify the file exists and contains the research analysis

2. **Add Comment to Linear Ticket**
   - Use the Linear tool to create a comment on ticket: $1
   - Post the complete contents of the research plan as the comment body
   - The comment should include all sections from the plan document
   - The comment MUST NOT include duplication of the ticket description or title.

## Context

- Research plan location: `$1-plan.md`
- Linear workspace access via Linear tools

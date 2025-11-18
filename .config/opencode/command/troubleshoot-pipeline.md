---
agent: devops-engineer
allowed-tools: Read, WebFetch
description: Troubleshoot CI/CD pipeline issues in Hatch1fy GitHub repositories
---

# Troubleshoot Pipeline

## Description:

$ARGUMENTS

## Troubleshooting Process

1. **Identify Repository & Pipeline**
   - Parse $ARGUMENTS to understand which repository and pipeline to examine
   - Expected format: "repo-name" or "repo-name: specific issue description"
   - Use GitHub tools to locate the repository in the Hatch1fy organization
   - List available workflows in `.github/workflows/`

2. **Gather Pipeline Information**
   - Read the workflow YAML file(s)
   - Use `gh` CLI to get workflow metadata:
     ```bash
     gh workflow list --repo Hatch1fy/<repo-name>
     gh workflow view <workflow-name> --repo Hatch1fy/<repo-name>
     ```
   - Identify the workflow structure, jobs, and steps

3. **Analyze Recent Run History**
   - Get recent workflow runs:
     ```bash
     gh run list --workflow=<workflow-name> --repo Hatch1fy/<repo-name> --limit 20
     ```
   - Identify patterns: Are all runs failing? Intermittent failures? Recent change?
   - Note timestamps and trigger events (push, PR, schedule, manual)

4. **Investigate Failed Runs**
   - For failed runs, retrieve logs:
     ```bash
     gh run view <run-id> --repo Hatch1fy/<repo-name> --log-failed
     ```
   - Use @sentient-agi-reasoning to analyze error patterns
   - Look for:
     - Syntax errors in workflow YAML
     - Permission/authentication failures
     - Dependency installation failures
     - Test failures
     - Timeout issues
     - Resource constraints
     - Environment variable/secret issues

5. **Root Cause Analysis with @sentient-agi-reasoning**
   ```
   Use @sentient-agi-reasoning to:
   - Correlate errors across multiple runs
   - Identify the root cause
   - Consider recent changes to workflow or codebase
   - Check for external dependencies (registries, APIs)
   - Evaluate resource allocation (runners, timeouts)
   ```

6. **Examine Related Files**
   - Check referenced files in the workflow:
     - Dockerfiles if building containers
     - Package manifests (package.json, requirements.txt, etc.)
     - Test configuration files
     - Build scripts
   - Search for recent changes to these files:
     ```bash
     git log --oneline --follow <file-path>
     ```

7. **Report Findings**

   Create a comprehensive report including:

   ## Pipeline Analysis Report

   ### Overview
   - Repository: Hatch1fy/<repo-name>
   - Workflow: <workflow-name>
   - Analysis Date: <date>

   ### Current Status
   - Recent run success rate
   - Last successful run
   - Current failure pattern

   ### Root Cause
   - Clear explanation of identified issue(s)
   - Evidence from logs and analysis
   - Timeline of when issue started

   ### Affected Components
   - Which jobs/steps are failing
   - Dependencies involved
   - External services impacted

   ### Impact Assessment
   - Who/what is blocked by this failure
   - Severity and urgency

   ### Recommended Solutions

   For each identified issue, provide:

   1. **Solution Description**: Clear explanation of the fix
   2. **Code Changes**: Exact YAML/code modifications needed
   3. **Risk Assessment**: Potential side effects
   4. **Testing Strategy**: How to verify the fix
   5. **Approval Required**: "⚠️ Requires user approval to implement"

   Example:
   ```yaml
   # Current (broken):
   - name: Install dependencies
     run: npm install

   # Proposed fix:
   - name: Install dependencies
     run: npm ci --legacy-peer-deps
   ```

   ### Alternative Approaches
   - If multiple solutions exist, present trade-offs

   ### Prevention Measures
   - How to prevent this issue in the future
   - Monitoring or testing improvements

8. **Wait for User Approval**

   After presenting the report and recommendations:

   **"I've identified [X] issue(s) and prepared solutions. Would you like me to:"**
   - **A)** Implement the recommended fix
   - **B)** Explore alternative solutions
   - **C)** Provide more details on a specific issue
   - **D)** Run a test workflow (if applicable)

   **DO NOT proceed with any modifications until the user explicitly approves.**

## Research Resources

When investigating issues, consult:
- GitHub Actions documentation: https://docs.github.com/en/actions
- GitHub CLI documentation: https://cli.github.com/manual/
- Common workflow patterns in similar repositories
- GitHub Actions community forums for known issues
- Terraform documentation: https://developer.hashicorp.com/terraform/docs
- Helm documentation: https://helm.sh/docs/
- Kubernetes documentation: https://kubernetes.io/docs/home/
- AWS documentation: https://docs.aws.amazon.com/
- GCP documentation: https://docs.cloud.google.com/docs

## Common Pipeline Issues

Quick reference for pattern matching:

| Symptom | Likely Cause | Investigation |
|---------|--------------|---------------|
| Syntax error in workflow | YAML formatting | Validate with yamllint |
| Permission denied | Secrets/tokens | Check repository secrets and GITHUB_TOKEN permissions |
| Command not found | Missing dependency | Check runner setup and installation steps |
| Timeout | Long-running job | Review job duration, consider splitting or optimizing |
| Flaky tests | Race conditions | Review test logs for intermittent failures |
| Rate limiting | API calls | Check for excessive requests to external services |
| Context not available | Missing artifacts | Verify artifact upload/download between jobs |

## Collaboration

If the issue requires expertise beyond pipeline configuration:
- Use `subagent_type="developer"` for implementing code-level fixes
- Use `subagent_type="maintenance-support"` for runtime debugging
- Use `subagent_type="security-scanner"` for security-related failures

## Quality Checklist

Before presenting findings:
- [ ] Root cause clearly identified with evidence
- [ ] All proposed solutions are actionable and specific
- [ ] Risk assessment completed for each solution
- [ ] Testing strategy defined
- [ ] User has clear next steps

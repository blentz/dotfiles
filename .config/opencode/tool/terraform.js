import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import { existsSync } from "fs";

export default tool({
  description: "Terraform infrastructure as code operations",
  args: {
    command: tool.schema.enum(['init', 'plan', 'apply', 'destroy', 'validate', 'fmt'])
      .describe("Terraform command to execute"),
    workingDirectory: tool.schema.string().optional()
      .describe("Working directory for terraform operations"),
    variables: tool.schema.array(tool.schema.object({
      key: tool.schema.string().describe("Variable name"),
      value: tool.schema.string().describe("Variable value")
    })).optional().describe("Terraform variables as key-value pairs"),
    varFile: tool.schema.string().optional()
      .describe("Path to terraform variables file"),
    autoApprove: tool.schema.boolean().optional()
      .describe("Auto-approve apply/destroy operations (required for destructive operations)"),
    options: tool.schema.string().optional()
      .describe("Additional terraform options")
  },
  async execute(args) {
    try {
      // Validate working directory
      const workingDir = args.workingDirectory || process.cwd();
      if (!existsSync(workingDir)) {
        return `Error: Working directory does not exist: ${workingDir}`;
      }

      // Basic path traversal protection
      if (workingDir.includes('../') || workingDir.includes('..\\')) {
        return "Error: Path traversal not allowed";
      }

      // Check for destructive operations
      const destructiveOps = ['apply', 'destroy'];
      if (destructiveOps.includes(args.command) && !args.autoApprove) {
        return `Error: ${args.command} is a destructive operation. Set autoApprove=true to confirm.`;
      }

      // Build terraform command
      let terraformCmd = `terraform ${args.command}`;

      // Add auto-approve for destructive operations
      if (destructiveOps.includes(args.command) && args.autoApprove) {
        terraformCmd += ' -auto-approve';
      }

      // Add variables
      if (args.variables && args.variables.length > 0) {
        for (const variable of args.variables) {
          terraformCmd += ` -var "${variable.key}=${variable.value}"`;
        }
      }

      // Add var-file
      if (args.varFile) {
        if (!existsSync(args.varFile)) {
          return `Error: Variable file not found: ${args.varFile}`;
        }

        // Basic path traversal protection for var file
        if (args.varFile.includes('../') || args.varFile.includes('..\\')) {
          return "Error: Path traversal not allowed in var file";
        }

        terraformCmd += ` -var-file="${args.varFile}"`;
      }

      // Add additional options
      if (args.options) {
        terraformCmd += ` ${args.options}`;
      }

      // Execute terraform command
      const result = execSync(terraformCmd, {
        cwd: workingDir,
        encoding: 'utf-8',
        timeout: 300000 // 5 minutes
      });

      return result || `Terraform ${args.command} completed successfully`;

    } catch (error) {
      // Parse terraform-specific errors for better user experience
      let errorMessage = error.message;
      if (error.message.includes('terraform not found')) {
        errorMessage = 'Terraform is not installed or not in PATH';
      } else if (error.message.includes('No configuration files')) {
        errorMessage = 'No terraform configuration files found in working directory';
      } else if (error.message.includes('Backend initialization required')) {
        errorMessage = 'Run "terraform init" first to initialize the backend';
      }

      return `Terraform error: ${errorMessage}`;
    }
  }
});
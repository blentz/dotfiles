import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";
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
    const safety = new ToolSafety('terraform', {
      commandTimeout: 300000, // 5 minutes for terraform operations
      logLevel: 'info'
    });

    try {
      // Validate working directory
      const workingDir = args.workingDirectory || process.cwd();
      if (!existsSync(workingDir)) {
        return `Error: Working directory does not exist: ${workingDir}`;
      }

      const pathValidation = safety.validatePath(workingDir);
      if (!pathValidation.success) {
        return `Error: ${pathValidation.error}`;
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
          const sanitizedKey = safety.sanitizeInput(variable.key);
          const sanitizedValue = safety.sanitizeInput(variable.value);
          terraformCmd += ` -var "${sanitizedKey}=${sanitizedValue}"`;
        }
      }

      // Add var-file
      if (args.varFile) {
        if (!existsSync(args.varFile)) {
          return `Error: Variable file not found: ${args.varFile}`;
        }
        const varFileValidation = safety.validateFile(args.varFile);
        if (!varFileValidation.success) {
          return `Error: ${varFileValidation.error}`;
        }
        terraformCmd += ` -var-file="${args.varFile}"`;
      }

      // Add additional options
      if (args.options) {
        const sanitizedOptions = safety.sanitizeInput(args.options);
        terraformCmd += ` ${sanitizedOptions}`;
      }

      // Execute terraform command
      safety.log(`Executing terraform command in directory: ${workingDir}`);
      const result = safety.executeCommand(terraformCmd, {
        cwd: workingDir,
        encoding: 'utf-8'
      });

      return result || `Terraform ${args.command} completed successfully`;

    } catch (error) {
      safety.log(`Terraform operation failed: ${error.message}`, 'error');

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
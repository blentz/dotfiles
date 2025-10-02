import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import { existsSync } from "fs";

const PROTECTED_NAMESPACES = ['kube-system', 'kube-public', 'kube-node-lease'];

export default tool({
  description: "Kubernetes cluster operations with safety checks",
  args: {
    operation: tool.schema.enum(['get', 'describe', 'apply', 'delete', 'logs'])
      .describe("Kubectl operation to perform"),
    resourceType: tool.schema.string().optional()
      .describe("Resource type (pods, services, deployments, etc.)"),
    resourceName: tool.schema.string().optional()
      .describe("Specific resource name"),
    namespace: tool.schema.string().optional()
      .describe("Kubernetes namespace (defaults to current context)"),
    outputFormat: tool.schema.enum(['json', 'yaml', 'wide']).optional()
      .describe("Output format"),
    file: tool.schema.string().optional()
      .describe("YAML/JSON file path for apply operations"),
    dryRun: tool.schema.boolean().optional()
      .describe("Enable dry-run mode (default: true for destructive ops)"),
    options: tool.schema.string().optional()
      .describe("Additional kubectl options")
  },
  async execute(args) {
    try {
      // Validate operation requirements
      if (['get', 'describe', 'delete'].includes(args.operation) && !args.resourceType) {
        return `Error: ${args.operation} operation requires resourceType parameter`;
      }

      if (args.operation === 'apply' && !args.file) {
        return `Error: apply operation requires file parameter`;
      }

      if (args.operation === 'logs' && !args.resourceName) {
        return `Error: logs operation requires resourceName parameter`;
      }

      // Basic file existence check for apply operations
      if (args.file) {
        if (!existsSync(args.file)) {
          return `Error: File not found: ${args.file}`;
        }

        // Basic path traversal protection
        if (args.file.includes('../') || args.file.includes('..\\')) {
          return "Error: Path traversal not allowed";
        }
      }

      // Check protected namespaces for destructive operations
      if (['delete', 'apply'].includes(args.operation) && args.namespace) {
        if (PROTECTED_NAMESPACES.includes(args.namespace)) {
          return `Error: Operation '${args.operation}' blocked on protected namespace: ${args.namespace}`;
        }
      }

      // Build kubectl command
      let kubectlCmd = 'kubectl';

      // Add namespace if specified
      if (args.namespace) {
        kubectlCmd += ` -n ${args.namespace}`;
      }

      // Add operation
      kubectlCmd += ` ${args.operation}`;

      // Handle operation-specific parameters
      switch (args.operation) {
        case 'get':
        case 'describe':
          kubectlCmd += ` ${args.resourceType}`;
          if (args.resourceName) {
            kubectlCmd += ` ${args.resourceName}`;
          }
          break;

        case 'delete':
          // Force dry-run for delete unless explicitly disabled
          const shouldDryRun = args.dryRun !== false;
          if (shouldDryRun) {
            kubectlCmd += ` --dry-run=client`;
          }
          kubectlCmd += ` ${args.resourceType}`;
          if (args.resourceName) {
            kubectlCmd += ` ${args.resourceName}`;
          }
          break;

        case 'apply':
          kubectlCmd += ` -f ${args.file}`;
          if (args.dryRun === true) {
            kubectlCmd += ` --dry-run=client`;
          }
          break;

        case 'logs':
          if (args.resourceType) {
            kubectlCmd += ` ${args.resourceType}/${args.resourceName}`;
          } else {
            kubectlCmd += ` ${args.resourceName}`;
          }
          break;
      }

      // Add output format
      if (args.outputFormat) {
        if (args.outputFormat === 'wide') {
          kubectlCmd += ` -o wide`;
        } else {
          kubectlCmd += ` -o ${args.outputFormat}`;
        }
      }

      // Add additional options
      if (args.options) {
        kubectlCmd += ` ${args.options}`;
      }

      // Execute command
      const result = execSync(kubectlCmd, {
        encoding: 'utf-8',
        timeout: 60000
      });

      return result.trim() || `kubectl ${args.operation} completed successfully`;

    } catch (error) {
      return `kubectl error: ${error.message}`;
    }
  }
});
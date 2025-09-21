import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";

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
    const safety = new ToolSafety('kubectl', {
      commandTimeout: 60000, // 60s for kubectl operations
      logLevel: 'info'
    });

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

      // Validate file for apply operations
      if (args.file) {
        const fileValidation = safety.validateFile(args.file);
        if (!fileValidation.success) {
          return `File validation failed: ${fileValidation.error}`;
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
        kubectlCmd += ` -n ${safety.sanitizeInput(args.namespace)}`;
      }

      // Add operation
      kubectlCmd += ` ${args.operation}`;

      // Handle operation-specific parameters
      switch (args.operation) {
        case 'get':
        case 'describe':
          kubectlCmd += ` ${safety.sanitizeInput(args.resourceType)}`;
          if (args.resourceName) {
            kubectlCmd += ` ${safety.sanitizeInput(args.resourceName)}`;
          }
          break;

        case 'delete':
          // Force dry-run for delete unless explicitly disabled
          const shouldDryRun = args.dryRun !== false;
          if (shouldDryRun) {
            kubectlCmd += ` --dry-run=client`;
            safety.log('Dry-run enabled for delete operation', 'info');
          }
          kubectlCmd += ` ${safety.sanitizeInput(args.resourceType)}`;
          if (args.resourceName) {
            kubectlCmd += ` ${safety.sanitizeInput(args.resourceName)}`;
          }
          break;

        case 'apply':
          kubectlCmd += ` -f ${safety.sanitizeInput(args.file)}`;
          if (args.dryRun === true) {
            kubectlCmd += ` --dry-run=client`;
          }
          break;

        case 'logs':
          if (args.resourceType) {
            kubectlCmd += ` ${safety.sanitizeInput(args.resourceType)}/${safety.sanitizeInput(args.resourceName)}`;
          } else {
            kubectlCmd += ` ${safety.sanitizeInput(args.resourceName)}`;
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
        kubectlCmd += ` ${safety.sanitizeInput(args.options)}`;
      }

      // Execute command
      const result = safety.executeCommand(kubectlCmd);
      return result.trim() || `kubectl ${args.operation} completed successfully`;

    } catch (error) {
      safety.log(`kubectl operation failed: ${error.message}`, 'error');
      return `kubectl error: ${error.message}`;
    }
  }
});
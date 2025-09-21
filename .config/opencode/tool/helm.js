import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";

const safety = new ToolSafety("helm", {
  commandTimeout: 120000, // 2 minute timeout for helm operations
  logLevel: 'info'
});

export default tool({
  description: "Helm chart management for Kubernetes",
  args: {
    operation: tool.schema.enum([
      'install', 'upgrade', 'uninstall', 'rollback',
      'list', 'status', 'history'
    ]).describe("Helm operation to perform"),

    releaseName: tool.schema.string()
      .optional()
      .describe("Release name (required for most operations)"),

    chart: tool.schema.string()
      .optional()
      .describe("Chart name or path (required for install/upgrade)"),

    namespace: tool.schema.string()
      .default("default")
      .describe("Kubernetes namespace"),

    valuesFile: tool.schema.string()
      .optional()
      .describe("Path to values file"),

    setValues: tool.schema.array(tool.schema.string())
      .optional()
      .describe("Set values on command line (key=value format)"),

    version: tool.schema.string()
      .optional()
      .describe("Chart version to install/upgrade to"),

    atomic: tool.schema.boolean()
      .default(true)
      .describe("Use atomic operation (auto-rollback on failure)"),

    wait: tool.schema.boolean()
      .default(true)
      .describe("Wait until deployment is ready"),

    timeout: tool.schema.string()
      .optional()
      .describe("Time to wait for operations (e.g., 5m, 10s)"),

    createNamespace: tool.schema.boolean()
      .default(false)
      .describe("Create namespace if it doesn't exist"),

    additionalFlags: tool.schema.string()
      .optional()
      .describe("Additional helm flags")
  },

  async execute(args) {
    // Validate required parameters based on operation
    if (['install', 'upgrade'].includes(args.operation)) {
      if (!args.releaseName || !args.chart) {
        return `Error: ${args.operation} requires both releaseName and chart`;
      }
    } else if (['uninstall', 'status', 'rollback', 'history'].includes(args.operation)) {
      if (!args.releaseName) {
        return `Error: ${args.operation} requires releaseName`;
      }
    }

    // Validate values file if provided
    if (args.valuesFile) {
      const validation = safety.validateFile(args.valuesFile);
      if (!validation.success) {
        return validation.error;
      }
    }

    // Build helm command
    let command = `helm ${args.operation}`;

    // Add release name
    if (args.releaseName) {
      command += ` ${safety.sanitizeInput(args.releaseName)}`;
    }

    // Add chart for install/upgrade
    if (args.chart && ['install', 'upgrade'].includes(args.operation)) {
      command += ` ${safety.sanitizeInput(args.chart)}`;
    }

    // Add namespace
    command += ` -n ${safety.sanitizeInput(args.namespace)}`;

    // Add atomic flag for install/upgrade
    if (args.atomic && ['install', 'upgrade'].includes(args.operation)) {
      command += ' --atomic';
    }

    // Add wait flag
    if (args.wait && ['install', 'upgrade', 'rollback'].includes(args.operation)) {
      command += ' --wait';
    }

    // Add timeout if specified
    if (args.timeout) {
      command += ` --timeout ${safety.sanitizeInput(args.timeout)}`;
    }

    // Add create namespace flag
    if (args.createNamespace && args.operation === 'install') {
      command += ' --create-namespace';
    }

    // Add values file
    if (args.valuesFile) {
      command += ` -f ${safety.sanitizeInput(args.valuesFile)}`;
    }

    // Add set values
    if (args.setValues && args.setValues.length > 0) {
      for (const setValue of args.setValues) {
        // Basic validation of key=value format
        if (!setValue.includes('=')) {
          return `Error: Invalid set value format: ${setValue}. Use key=value format.`;
        }
        command += ` --set ${safety.sanitizeInput(setValue)}`;
      }
    }

    // Add version if specified
    if (args.version) {
      command += ` --version ${safety.sanitizeInput(args.version)}`;
    }

    // Add additional flags
    if (args.additionalFlags) {
      command += ` ${safety.sanitizeInput(args.additionalFlags)}`;
    }

    try {
      safety.log(`Executing helm command: ${args.operation} for ${args.releaseName || 'cluster'}`);
      const result = safety.executeCommand(command);
      return result || `Helm ${args.operation} completed successfully`;
    } catch (error) {
      return `Helm error: ${error.message}`;
    }
  }
});
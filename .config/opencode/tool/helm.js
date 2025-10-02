import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import { existsSync } from "fs";

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

    // Basic file existence check for values file
    if (args.valuesFile) {
      if (!existsSync(args.valuesFile)) {
        return `Error: Values file not found: ${args.valuesFile}`;
      }

      // Basic path traversal protection
      if (args.valuesFile.includes('../') || args.valuesFile.includes('..\\')) {
        return "Error: Path traversal not allowed in values file";
      }
    }

    // Build helm command
    let command = `helm ${args.operation}`;

    // Add release name
    if (args.releaseName) {
      command += ` ${args.releaseName}`;
    }

    // Add chart for install/upgrade
    if (args.chart && ['install', 'upgrade'].includes(args.operation)) {
      command += ` ${args.chart}`;
    }

    // Add namespace
    command += ` -n ${args.namespace}`;

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
      command += ` --timeout ${args.timeout}`;
    }

    // Add create namespace flag
    if (args.createNamespace && args.operation === 'install') {
      command += ' --create-namespace';
    }

    // Add values file
    if (args.valuesFile) {
      command += ` -f ${args.valuesFile}`;
    }

    // Add set values
    if (args.setValues && args.setValues.length > 0) {
      for (const setValue of args.setValues) {
        // Basic validation of key=value format
        if (!setValue.includes('=')) {
          return `Error: Invalid set value format: ${setValue}. Use key=value format.`;
        }
        command += ` --set ${setValue}`;
      }
    }

    // Add version if specified
    if (args.version) {
      command += ` --version ${args.version}`;
    }

    // Add additional flags
    if (args.additionalFlags) {
      command += ` ${args.additionalFlags}`;
    }

    try {
      const result = execSync(command, {
        encoding: 'utf-8',
        timeout: 120000 // 2 minutes
      });
      return result || `Helm ${args.operation} completed successfully`;
    } catch (error) {
      return `Helm error: ${error.message}`;
    }
  }
});
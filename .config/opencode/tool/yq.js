import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import { existsSync } from "fs";

export default tool({
  description: "Query and manipulate YAML/JSON/XML files using yq",
  args: {
    query: tool.schema.string().describe("yq query expression"),
    file: tool.schema.string().optional().describe("File path to process"),
    input: tool.schema.string().optional().describe("Direct string input"),
    inputFormat: tool.schema.enum([
      'auto', 'yaml', 'json', 'xml', 'csv', 'tsv', 'props', 'base64', 'uri', 'toml', 'lua', 'ini'
    ]).optional().describe("Input format (defaults to auto-detection)"),
    outputFormat: tool.schema.enum([
      'auto', 'yaml', 'json', 'xml', 'csv', 'tsv', 'props', 'base64', 'uri', 'toml', 'shell', 'lua', 'ini'
    ]).optional().describe("Output format (defaults to auto-detection)"),
    inPlace: tool.schema.boolean().optional().describe("Edit file in place (only valid with file input)")
  },
  async execute(args) {
    try {
      // Validate input requirements
      if (!args.file && !args.input) {
        return "Error: Either 'file' or 'input' must be provided";
      }

      if (args.file && args.input) {
        return "Error: Cannot specify both 'file' and 'input' - choose one";
      }

      if (args.inPlace && !args.file) {
        return "Error: 'inPlace' option requires 'file' input";
      }

      let yqCmd = 'yq';

      // Handle file input
      if (args.file) {
        // Basic file existence check
        if (!existsSync(args.file)) {
          return `Error: File not found: ${args.file}`;
        }

        // Basic path traversal protection
        if (args.file.includes('../') || args.file.includes('..\\')) {
          return "Error: Path traversal not allowed";
        }

        // Add in-place flag if requested
        if (args.inPlace) {
          yqCmd += ' -i';
        }

        // Add input format if specified
        if (args.inputFormat && args.inputFormat !== 'auto') {
          yqCmd += ` -p ${args.inputFormat}`;
        }

        // Add output format if specified (not applicable for in-place)
        if (args.outputFormat && args.outputFormat !== 'auto' && !args.inPlace) {
          yqCmd += ` -o ${args.outputFormat}`;
        }

        // Add query and file
        yqCmd += ` '${args.query}' "${args.file}"`;
      } else {
        // Handle string input
        // Add input format if specified
        if (args.inputFormat && args.inputFormat !== 'auto') {
          yqCmd += ` -p ${args.inputFormat}`;
        }

        // Add output format if specified
        if (args.outputFormat && args.outputFormat !== 'auto') {
          yqCmd += ` -o ${args.outputFormat}`;
        }

        // Add query
        yqCmd += ` '${args.query}'`;
      }

      // Execute yq command
      const result = execSync(yqCmd, {
        input: args.input || undefined,
        encoding: 'utf-8',
        timeout: 30000
      });

      // For in-place operations, return success message
      if (args.inPlace) {
        return `Successfully updated ${args.file} in place`;
      }

      return result.trim();
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});
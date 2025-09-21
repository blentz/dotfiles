import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";

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
    const safety = new ToolSafety('yq', {
      maxFileSize: 50 * 1024 * 1024, // 50MB for large YAML/JSON files
      commandTimeout: 60000 // 60s for complex queries
    });

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
      let inputData = null;

      // Handle file input
      if (args.file) {
        // Validate file using ToolSafety
        const fileValidation = safety.validateFile(args.file);
        if (!fileValidation.success) {
          return fileValidation.error;
        }

        // Validate path to prevent directory traversal
        const pathValidation = safety.validatePath(args.file);
        if (!pathValidation.success) {
          return pathValidation.error;
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
        yqCmd += ` '${safety.sanitizeInput(args.query)}' "${pathValidation.resolvedPath}"`;
      } else {
        // Handle string input
        inputData = args.input;

        // Add input format if specified
        if (args.inputFormat && args.inputFormat !== 'auto') {
          yqCmd += ` -p ${args.inputFormat}`;
        }

        // Add output format if specified
        if (args.outputFormat && args.outputFormat !== 'auto') {
          yqCmd += ` -o ${args.outputFormat}`;
        }

        // Add query
        yqCmd += ` '${safety.sanitizeInput(args.query)}'`;
      }

      // Execute yq command
      const result = safety.executeCommand(yqCmd, {
        input: inputData,
        encoding: 'utf-8'
      });

      // For in-place operations, return success message
      if (args.inPlace) {
        return `Successfully updated ${args.file} in place (backup created as ${args.file}.bak)`;
      }

      return result.trim();
    } catch (error) {
      safety.log(`yq execution failed: ${error.message}`, 'error');
      return `Error: ${error.message}`;
    }
  }
});
import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const safety = new ToolSafety("awk-tool", {
  maxFileSize: 5 * 1024 * 1024, // 5MB limit
  commandTimeout: 10000 // 10s timeout
});

export default tool({
  description: "Execute AWK programs on input text or files",
  args: {
    program: tool.schema.string().describe("AWK program/pattern to execute"),
    input: tool.schema.string().describe("Input file path or text content"),
    isFile: tool.schema.boolean().describe("Whether input is a file path").default(false),
    fieldSeparator: tool.schema.string().describe("Field separator (default: whitespace)").optional(),
    variables: tool.schema.object().describe("AWK variables to set").optional(),
    outputFormat: tool.schema.string().describe("Output format specification").optional()
  },

  async execute(args) {
    try {
      // Validate input if it's a file
      if (args.isFile) {
        const validation = safety.validateFile(args.input);
        if (!validation.success) {
          return validation.error;
        }
      }

      // Create temporary file for non-file input
      let inputFile = args.isFile ? args.input : join(tmpdir(), `awk-input-${Date.now()}.txt`);
      if (!args.isFile) {
        try {
          writeFileSync(inputFile, args.input);
        } catch (error) {
          return `Error creating temporary file: ${error.message}`;
        }
      }

      // Build AWK command
      let cmd = ["awk"];

      // Add field separator if specified
      if (args.fieldSeparator) {
        cmd.push(`-F"${safety.sanitizeInput(args.fieldSeparator)}"`);
      }

      // Add variables if specified
      if (args.variables && typeof args.variables === 'object') {
        Object.entries(args.variables).forEach(([key, value]) => {
          const safeKey = safety.sanitizeInput(key);
          const safeValue = safety.sanitizeInput(String(value));
          cmd.push(`-v ${safeKey}="${safeValue}"`);
        });
      }

      // Add output format if specified
      if (args.outputFormat) {
        const safeFormat = safety.sanitizeInput(args.outputFormat);
        cmd.push(`-v OFS="${safeFormat}"`);
      }

      // Sanitize AWK program while preserving necessary syntax
      const sanitizeAwkProgram = (program) => {
        // Escape single quotes and backslashes
        let sanitized = program.replace(/['\\]/g, '\\$&');
        // Remove other dangerous shell characters but preserve {} and $
        sanitized = sanitized.replace(/[;&|`()[\]<>"]/g, '');
        return sanitized;
      };

      // Add program and input file
      cmd.push(`'${sanitizeAwkProgram(args.program)}'`);
      cmd.push(`"${inputFile}"`);

      // Execute command with safety wrapper
      const result = safety.executeCommand(cmd.join(" "));

      // Cleanup temporary file
      if (!args.isFile) {
        try {
          unlinkSync(inputFile);
        } catch (error) {
          safety.log(`Warning: Failed to cleanup temporary file: ${error.message}`, 'warn');
        }
      }

      return result;
    } catch (error) {
      return `Error executing AWK command: ${error.message}`;
    }
  }
});
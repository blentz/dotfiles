import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

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
      // Basic file existence check if input is a file
      if (args.isFile && !existsSync(args.input)) {
        return `Error: File not found: ${args.input}`;
      }

      // Basic path traversal protection
      if (args.isFile && (args.input.includes('../') || args.input.includes('..\\'))) {
        return "Error: Path traversal not allowed";
      }

      // Create temporary file for non-file input
      let inputFile = args.isFile ? args.input : join(tmpdir(), `awk-input-${Date.now()}.txt`);
      if (!args.isFile) {
        writeFileSync(inputFile, args.input);
      }

      // Build AWK command
      let cmd = ["awk"];

      // Add field separator if specified
      if (args.fieldSeparator) {
        cmd.push(`-F"${args.fieldSeparator}"`);
      }

      // Add variables if specified
      if (args.variables && typeof args.variables === 'object') {
        Object.entries(args.variables).forEach(([key, value]) => {
          cmd.push(`-v ${key}="${String(value)}"`);
        });
      }

      // Add output format if specified
      if (args.outputFormat) {
        cmd.push(`-v OFS="${args.outputFormat}"`);
      }

      // Add program and input file
      cmd.push(`'${args.program}'`);
      cmd.push(`"${inputFile}"`);

      // Execute command
      const result = execSync(cmd.join(" "), {
        encoding: 'utf-8',
        timeout: 30000
      });

      // Cleanup temporary file
      if (!args.isFile) {
        try {
          unlinkSync(inputFile);
        } catch (error) {
          // Cleanup failure is not critical
        }
      }

      return result;
    } catch (error) {
      return `Error executing AWK command: ${error.message}`;
    }
  }
});
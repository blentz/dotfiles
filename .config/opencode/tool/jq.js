import { tool } from "@opencode-ai/plugin";
import { spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";

export default tool({
  description: "Query JSON data using jq",
  args: {
    query: tool.schema.string().describe("jq query expression"),
    file: tool.schema.string().optional().describe("JSON file path"),
    input: tool.schema.string().optional().describe("JSON string input")
  },
  async execute(args) {
    try {
      let jsonInput;

      if (args.file) {
        // Basic file existence check
        if (!existsSync(args.file)) {
          return `Error: File not found: ${args.file}`;
        }

        // Basic path traversal protection
        if (args.file.includes('../') || args.file.includes('..\\')) {
          return "Error: Path traversal not allowed";
        }

        jsonInput = readFileSync(args.file, 'utf-8');
      } else if (args.input) {
        jsonInput = args.input;
      } else {
        return "Error: Either 'file' or 'input' must be provided";
      }

      // Basic JSON validation
      try {
        JSON.parse(jsonInput);
      } catch (error) {
        return `Error: Invalid JSON - ${error.message}`;
      }

      // Execute jq safely using spawnSync with array arguments
      const result = spawnSync('jq', [args.query], {
        input: jsonInput,
        encoding: 'utf-8',
        timeout: 30000
      });

      if (result.error) {
        return `Error: jq execution failed - ${result.error.message}`;
      }

      if (result.status !== 0) {
        return `Error: jq exited with code ${result.status} - ${result.stderr}`;
      }

      return result.stdout.trim();
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});
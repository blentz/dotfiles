import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import { platform } from "os";

export default tool({
  description: "Stream editor for text substitution",
  args: {
    pattern: tool.schema.string().describe("Pattern to search for"),
    replacement: tool.schema.string().describe("Replacement text"),
    file: tool.schema.string().describe("File path to process"),
    global: tool.schema.boolean().optional().describe("Replace all occurrences (default: false)"),
    dryRun: tool.schema.boolean().optional().describe("Show changes without applying them (default: false)")
  },
  async execute(args) {
    try {
      // Basic file existence check
      if (!existsSync(args.file)) {
        return `Error: File not found: ${args.file}`;
      }

      // Basic path traversal protection
      if (args.file.includes('../') || args.file.includes('..\\')) {
        return "Error: Path traversal not allowed";
      }

      // Choose a delimiter that doesn't appear in pattern/replacement
      const delimiters = ['/', '|', ':', '#', '@', '%', '!'];
      const delimiter = delimiters.find(d => !args.pattern.includes(d) && !args.replacement.includes(d));
      if (!delimiter) {
        return "Error: Pattern/replacement contains all possible delimiters";
      }

      // Handle Windows paths
      const normalizedFile = platform() === 'win32' ?
        args.file.replace(/\\/g, '/') :
        args.file;

      // Build sed command
      const sedFlags = [];
      if (args.global) {
        sedFlags.push('g');
      }

      if (args.dryRun) {
        // Dry run - show what would change
        const cmd = `sed 's${delimiter}${args.pattern}${delimiter}${args.replacement}${delimiter}${sedFlags.join('')}' "${normalizedFile}"`;
        const preview = execSync(cmd, { encoding: 'utf-8', timeout: 30000 });
        return {
          success: true,
          preview: preview.trim(),
          message: "Dry run completed. Above shows what would be changed."
        };
      }

      // Real execution with backup
      const cmd = `sed -i.bak 's${delimiter}${args.pattern}${delimiter}${args.replacement}${delimiter}${sedFlags.join('')}' "${normalizedFile}"`;
      execSync(cmd, { encoding: 'utf-8', timeout: 30000 });

      // Clean up backup file
      try {
        await unlink(`${args.file}.bak`);
      } catch (cleanupError) {
        // Backup cleanup failure is not critical
      }

      const operation = args.global ? "all occurrences" : "first occurrence";
      return `Replaced ${operation} of "${args.pattern}" with "${args.replacement}" in ${args.file}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});
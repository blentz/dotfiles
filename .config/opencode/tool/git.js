import { tool } from "@opencode-ai/plugin";
import { execSync } from "child_process";

export default tool({
  description: "Git version control operations",
  args: {
    command: tool.schema.enum(['status', 'diff', 'log', 'branch', 'add', 'commit'])
      .describe("Git command to execute"),
    message: tool.schema.string().optional().describe("Commit message"),
    files: tool.schema.array(tool.schema.string()).optional().describe("Files to add"),
    options: tool.schema.string().optional().describe("Additional git options")
  },
  async execute(args) {
    let gitCmd = `git ${args.command}`;

    // Handle specific commands
    if (args.command === 'commit' && args.message) {
      // Simple shell escaping for commit message
      const escapedMessage = args.message.replace(/'/g, "'\"'\"'");
      gitCmd += ` -m '${escapedMessage}'`;
    } else if (args.command === 'add' && args.files) {
      gitCmd += ` ${args.files.join(' ')}`;
    }

    // Add any additional options
    if (args.options) {
      gitCmd += ` ${args.options}`;
    }

    try {
      const result = execSync(gitCmd, {
        encoding: 'utf-8',
        timeout: 30000
      });
      return result || `Git ${args.command} completed successfully`;
    } catch (error) {
      return `Git error: ${error.message}`;
    }
  }
});
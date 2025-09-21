import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";

// Initialize safety module for git operations
const safety = new ToolSafety('git', {
  commandTimeout: 30000,
  logLevel: 'info'
});

// Size limits for git operations
const GIT_LIMITS = {
  MAX_COMMIT_MSG_SIZE: 1024 * 1024,     // 1MB max commit message
  MAX_FILES_PER_COMMAND: 1000,          // Max files per operation
  MAX_FILE_SIZE: 50 * 1024 * 1024,      // 50MB max single file
  MAX_TOTAL_SIZE: 500 * 1024 * 1024,    // 500MB max total size
  MAX_OPTION_LENGTH: 1024,              // 1KB max option length
};

// Whitelist of safe git options to prevent command injection
const SAFE_GIT_OPTIONS = new Set([
  // Status options
  '--short', '-s', '--branch', '-b', '--porcelain', '--long',
  // Diff options
  '--cached', '--staged', '--name-only', '--name-status', '--stat',
  '--numstat', '--shortstat', '--summary', '--patch-with-stat',
  // Log options
  '--oneline', '--graph', '--decorate', '--all', '--follow',
  '--since', '--until', '--author', '--grep', '--max-count',
  '--skip', '--reverse', '--merges', '--no-merges',
  // Branch options
  '--list', '-l', '--all', '-a', '--remotes', '-r', '--merged',
  '--no-merged', '--contains', '--no-contains',
  // Add options
  '--dry-run', '-n', '--verbose', '-v', '--force', '-f',
  '--interactive', '-i', '--patch', '-p', '--update', '-u',
  '--all', '-A', '--no-ignore-removal', '--ignore-removal',
  // Commit options
  '--dry-run', '--verbose', '-v', '--quiet', '-q', '--amend',
  '--no-edit', '--allow-empty', '--allow-empty-message',
  '--cleanup', '--no-verify', '-n', '--verify'
]);

/**
 * Validates and sanitizes git options to prevent command injection
 * @param {string} options - Raw options string
 * @returns {string} Sanitized options or empty string if invalid
 */
function validateGitOptions(options) {
  if (!options || typeof options !== 'string') {
    return '';
  }

  // Split options and validate each one
  const optionParts = options.trim().split(/\s+/);
  const validOptions = [];

  for (const option of optionParts) {
    // Skip empty parts
    if (!option) continue;

    // Check if option starts with dash (git options should)
    if (!option.startsWith('-')) {
      safety.log(`Invalid git option format: ${option}`, 'warn');
      continue;
    }

    // Extract base option (remove values like --max-count=10)
    const baseOption = option.split('=')[0];

    if (SAFE_GIT_OPTIONS.has(baseOption)) {
      validOptions.push(safety.sanitizeInput(option));
    } else {
      safety.log(`Blocked unsafe git option: ${option}`, 'warn');
    }
  }

  return validOptions.join(' ');
}

/**
 * Properly escapes commit message for shell execution
 * @param {string} message - Commit message to escape
 * @returns {string} Shell-escaped message
 */
function escapeCommitMessage(message) {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // Use single quotes to preserve most characters, escape single quotes within
  return `'${message.replace(/'/g, "'\"'\"'")}'`;
}

export default tool({
  description: "Git version control operations with security protections",
  args: {
    command: tool.schema.enum(['status', 'diff', 'log', 'branch', 'add', 'commit'])
      .describe("Git command to execute"),
    message: tool.schema.string().optional().describe("Commit message"),
    files: tool.schema.array(tool.schema.string()).optional().describe("Files to add"),
    options: tool.schema.string().optional().describe("Additional git options")
  },
  async execute(args) {
    try {
      // Validate command (already restricted by enum, but double-check)
      const validCommands = ['status', 'diff', 'log', 'branch', 'add', 'commit'];
      if (!validCommands.includes(args.command)) {
        return `Git error: Invalid command '${args.command}'`;
      }

      // Size validation for commit messages
      if (args.command === 'commit' && args.message) {
        const msgSize = Buffer.byteLength(args.message);
        if (msgSize > GIT_LIMITS.MAX_COMMIT_MSG_SIZE) {
          return `Git error: Commit message too large (${msgSize} bytes, max ${GIT_LIMITS.MAX_COMMIT_MSG_SIZE})`;
        }
      }

      // Size validation for files
      if (args.files && args.files.length > GIT_LIMITS.MAX_FILES_PER_COMMAND) {
        return `Git error: Too many files (${args.files.length}, max ${GIT_LIMITS.MAX_FILES_PER_COMMAND})`;
      }

      // Option length validation
      if (args.options && args.options.length > GIT_LIMITS.MAX_OPTION_LENGTH) {
        return `Git error: Options string too long (${args.options.length}, max ${GIT_LIMITS.MAX_OPTION_LENGTH})`;
      }

      let gitCmd = `git ${args.command}`;

      // Handle specific commands with proper validation
      if (args.command === 'commit' && args.message) {
        const escapedMessage = escapeCommitMessage(args.message);
        if (!escapedMessage) {
          return 'Git error: Invalid commit message';
        }
        gitCmd += ` -m ${escapedMessage}`;

      } else if (args.command === 'add' && args.files) {
        // Validate each file path
        const validFiles = [];
        for (const file of args.files) {
          const pathValidation = safety.validatePath(file);
          if (pathValidation.success) {
            validFiles.push(safety.sanitizeInput(file));
          } else {
            safety.log(`Invalid file path: ${file} - ${pathValidation.error}`, 'warn');
            return `Git error: ${pathValidation.error}`;
          }
        }

        if (validFiles.length === 0) {
          return 'Git error: No valid files to add';
        }

        gitCmd += ` ${validFiles.join(' ')}`;

      } else if (args.options) {
        const validOptions = validateGitOptions(args.options);
        if (validOptions) {
          gitCmd += ` ${validOptions}`;
        } else if (args.options.trim()) {
          // Only warn if there were actual options that got filtered
          safety.log(`All git options were filtered out: ${args.options}`, 'warn');
        }
      }

      // Execute command with safety protections
      const result = safety.executeCommand(gitCmd);
      return result || `Git ${args.command} completed successfully`;

    } catch (error) {
      safety.log(`Git command failed: ${error.message}`, 'error');
      return `Git error: ${error.message}`;
    }
  }
});
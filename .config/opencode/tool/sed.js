import { tool } from "@opencode-ai/plugin";
import { ToolSafety } from "./shared/safety.js";
import { unlink } from "fs/promises";
import { platform } from "os";

// Initialize safety module with sed-specific config
const safety = new ToolSafety("sed", {
  maxFileSize: 5 * 1024 * 1024, // 5MB limit for text files
  commandTimeout: 10000, // 10s timeout
  logLevel: "info"
});

// Maximum pattern/replacement size to prevent memory issues
const MAX_STRING_LENGTH = 1024 * 1024; // 1MB

// Pattern optimization rules
const OPTIMIZATION_RULES = [
  // Simplify redundant alternations
  { pattern: /(?:a|a)+/, replacement: 'a+' },
  { pattern: /(?:[ab]|[ab])+/, replacement: '[ab]+' },
  // Simplify nested quantifiers
  { pattern: /(?:a*)*/, replacement: 'a*' },
  { pattern: /(?:a+)+/, replacement: 'a+' },
  // Remove unnecessary non-capturing groups
  { pattern: /\(\?:([^()]+)\)/, replacement: '$1' },
  // Optimize character classes
  { pattern: /\[a-zA-Z0-9_\]/, replacement: '\\w' },
  { pattern: /\[0-9\]/, replacement: '\\d' },
  // Simplify repeated characters
  { pattern: /(.)\1{3,}/, replacement: '$1{4,}' }
];

/**
 * Optimizes a regex pattern to reduce complexity
 * @param {string} pattern - Pattern to optimize
 * @returns {string} Optimized pattern
 */
function optimizePattern(pattern) {
  let optimized = pattern;
  let lastPattern;
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops

  // Keep optimizing until no more changes can be made
  do {
    lastPattern = optimized;
    for (const rule of OPTIMIZATION_RULES) {
      optimized = optimized.replace(rule.pattern, rule.replacement);
    }
    iterations++;

    // Safety check to prevent infinite loops
    if (iterations >= maxIterations) {
      safety.log('warn', `Pattern optimization stopped after ${maxIterations} iterations for pattern: ${pattern}`);
      break;
    }
  } while (optimized !== lastPattern);

  return optimized;
}

// Pattern complexity limits
const PATTERN_LIMITS = {
  MAX_GROUPS: 5,              // Maximum nested groups
  MAX_QUANTIFIERS: 10,        // Maximum number of quantifiers
  MAX_ALTERNATIONS: 5,        // Maximum number of alternations
  MAX_LOOKBEHIND: 100,       // Maximum lookbehind length
  MAX_BACKREFS: 3,           // Maximum number of backreferences
  DANGEROUS_PATTERNS: [       // Known problematic patterns
    /(.+)+/,                 // Nested quantifiers
    /(a|a)+/,               // Redundant alternation
    /(.*)(\1)+/,            // Backreference with quantifier
    /(?<=.{100,})/,         // Large lookbehind
  ]
};

/**
 * Validates pattern complexity to prevent ReDoS attacks
 * @param {string} pattern - Regular expression pattern to validate
 * @returns {Object} Validation result with success/error
 */
function validatePatternComplexity(pattern) {
  try {
    const metrics = {
      groups: 0,
      quantifiers: 0,
      alternations: 0,
      backrefs: 0,
      lookbehind: 0
    };

    // Count nested groups
    metrics.groups = (pattern.match(/\([^()]*\)/g) || []).length;

    // Count quantifiers
    metrics.quantifiers = (pattern.match(/[+*?{]/g) || []).length;

    // Count alternations
    metrics.alternations = (pattern.match(/\|/g) || []).length;

    // Count backreferences
    metrics.backrefs = (pattern.match(/\\\d+/g) || []).length;

    // Check lookbehind length
    const lookbehind = pattern.match(/\(\?<=.+?\)/g) || [];
    for (const lb of lookbehind) {
      metrics.lookbehind = Math.max(metrics.lookbehind, lb.length - 4);
    }

    // Check against limits
    if (metrics.groups > PATTERN_LIMITS.MAX_GROUPS) {
      return {
        success: false,
        error: `Too many nested groups (${metrics.groups}, max ${PATTERN_LIMITS.MAX_GROUPS})`
      };
    }

    if (metrics.quantifiers > PATTERN_LIMITS.MAX_QUANTIFIERS) {
      return {
        success: false,
        error: `Too many quantifiers (${metrics.quantifiers}, max ${PATTERN_LIMITS.MAX_QUANTIFIERS})`
      };
    }

    if (metrics.alternations > PATTERN_LIMITS.MAX_ALTERNATIONS) {
      return {
        success: false,
        error: `Too many alternations (${metrics.alternations}, max ${PATTERN_LIMITS.MAX_ALTERNATIONS})`
      };
    }

    if (metrics.backrefs > PATTERN_LIMITS.MAX_BACKREFS) {
      return {
        success: false,
        error: `Too many backreferences (${metrics.backrefs}, max ${PATTERN_LIMITS.MAX_BACKREFS})`
      };
    }

    if (metrics.lookbehind > PATTERN_LIMITS.MAX_LOOKBEHIND) {
      return {
        success: false,
        error: `Lookbehind too long (${metrics.lookbehind}, max ${PATTERN_LIMITS.MAX_LOOKBEHIND})`
      };
    }

    // Check for known dangerous patterns
    for (const dangerous of PATTERN_LIMITS.DANGEROUS_PATTERNS) {
      if (dangerous.test(pattern)) {
        return {
          success: false,
          error: 'Pattern matches known problematic pattern that could cause ReDoS'
        };
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Pattern validation failed: ${error.message}`
    };
  }
}

// Internal helper functions - not exported as tools
// // export { validatePatternComplexity, optimizePattern }; // These are internal helpers, not tools

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
      // Input size validation
      if (args.pattern.length > MAX_STRING_LENGTH) {
        return `Error: Pattern too large (max ${MAX_STRING_LENGTH} bytes)`;
      }
      if (args.replacement.length > MAX_STRING_LENGTH) {
        return `Error: Replacement too large (max ${MAX_STRING_LENGTH} bytes)`;
      }

      // Validate file first
      const fileValidation = safety.validateFile(args.file);
      if (!fileValidation.success) {
        return fileValidation.error;
      }

      // Validate path for traversal attacks
      const pathValidation = safety.validatePath(args.file);
      if (!pathValidation.success) {
        return pathValidation.error;
      }

      // Skip optimization for now as it's causing issues with simple patterns
      // TODO: Fix optimization rules to work properly with sed patterns
      let pattern = args.pattern;
      pattern = safety.sanitizeInput(pattern);

      // Sanitize other inputs
      const replacement = safety.sanitizeInput(args.replacement);
      const file = pathValidation.resolvedPath;

      // Basic pattern validation
      if (pattern.length === 0) {
        return "Error: Pattern cannot be empty";
      }

      // Only validate pattern complexity for regex patterns (containing special chars)
      const hasRegexChars = /[.*+?^${}()|[\]\\]/.test(pattern);
      if (hasRegexChars) {
        const complexityValidation = validatePatternComplexity(pattern);
        if (!complexityValidation.success) {
          return `Error: ${complexityValidation.error}`;
        }
      }

      // Choose a delimiter that doesn't appear in pattern/replacement
      const delimiters = ['/', '|', ':', '#', '@', '%', '!'];
      const delimiter = delimiters.find(d => !pattern.includes(d) && !replacement.includes(d));
      if (!delimiter) {
        return "Error: Pattern/replacement contains all possible delimiters";
      }

      // Handle Windows paths
      const normalizedFile = platform() === 'win32' ?
        file.replace(/\\/g, '/') :
        file;

      // Build sed command
      const sedFlags = [];
      if (args.global) {
        sedFlags.push('g');
      }
      if (args.dryRun) {
        // Remove -i flag for dry run
        const cmd = `sed 's${delimiter}${pattern}${delimiter}${replacement}${delimiter}${sedFlags.join('')}' "${normalizedFile}"`;
        const preview = safety.executeCommand(cmd);

        // Ensure preview is a string
        const previewText = preview ? preview.toString().trim() : '';

        return {
          success: true,
          preview: previewText,
          message: "Dry run completed. Above shows what would be changed."
        };
      }

      // Real execution with backup
      const cmd = `sed -i.bak 's${delimiter}${pattern}${delimiter}${replacement}${delimiter}${sedFlags.join('')}' "${normalizedFile}"`;

      const result = safety.executeCommand(cmd);

      // Verify command completed successfully (sed with -i returns empty string on success)
      if (result === null || result === undefined) {
        throw new Error("sed command failed to execute properly");
      }

      // Clean up backup file
      try {
        await unlink(`${file}.bak`);
      } catch (cleanupError) {
        safety.log(`Failed to clean up backup file: ${cleanupError.message}`, 'warn');
      }

      const operation = args.global ? "all occurrences" : "first occurrence";
      return `Replaced ${operation} of "${pattern}" with "${replacement}" in ${file}`;
    } catch (error) {
      safety.log(`Sed operation failed: ${error.message}`, 'error');

      // Handle common errors more gracefully
      if (error.message.includes("command not found")) {
        return "Error: sed command not available on system";
      }
      if (error.message.includes("Permission denied")) {
        return "Error: Permission denied - check file permissions";
      }
      if (error.message.includes("No such file")) {
        return "Error: File not found or inaccessible";
      }

      return `Error: Operation failed - ${error.message}`;
    }
  }
});
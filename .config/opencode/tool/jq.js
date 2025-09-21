import { tool } from "@opencode-ai/plugin";
import { spawnSync } from "child_process";
import { readFileSync } from "fs";
import { ToolSafety } from "./shared/safety.js";

// Initialize security module
const safety = new ToolSafety('jq', {
  maxFileSize: 50 * 1024 * 1024, // 50MB for large JSON files
  commandTimeout: 60000, // 60s for complex queries
  logLevel: 'info'
});

// Query complexity limits
const QUERY_LIMITS = {
  MAX_PIPE_DEPTH: 10,
  MAX_FILTERS: 10,
  MAX_OPERATIONS: 50,
  MAX_RECURSION_DEPTH: 3,
  MAX_ARRAY_SIZE: 10000,
  MAX_STRING_SIZE: 1024 * 1024 // 1MB
};

/**
 * Calculates complexity metrics for a jq query
 * @param {string} query - The jq query to analyze
 * @returns {Object} Complexity metrics
 */
function calculateQueryComplexity(query) {
  const metrics = {
    pipeDepth: 0,
    filterCount: 0,
    operationCount: 0,
    hasRecursion: false,
    maxArrayAccess: 0
  };

  // Count pipe operations
  metrics.pipeDepth = (query.match(/\|/g) || []).length + 1;

  // Count filter operations
  metrics.filterCount = (query.match(/\b(select|map|reduce|walk|while)\b/g) || []).length;

  // Count general operations
  metrics.operationCount = (query.match(/\b(add|sub|mul|div|mod|pow|floor|sqrt|min|max|sort|reverse|unique|flatten|range|recurse|tonumber|tostring|type|keys|has|in|index|indices|length|utf8bytelength|startswith|endswith|match|test|capture|scan|splits|sub|gsub|debug|stderr|halt|error|isfinite|isinfinite|isnan|isnormal|infinite|nan|sort_by|group_by|min_by|max_by|unique_by|join|explode|implode|split|ltrimstr|rtrimstr|trim|ascii_downcase|ascii_upcase|tojson|fromjson|todate|fromdate|now|strftime|strptime|mktime|gmtime|localtime|strflocaltime|fromdateiso8601|todateiso8601|fromtimestamp|totimestamp|format|@base64|@base64d|@uri|@urid|@html|@json|@sh|@csv|@tsv|@uri|@base64|@base64d)\b/g) || []).length;

  // Check for recursion
  metrics.hasRecursion = /\brecurse\b/.test(query);

  // Check array access depth
  const arrayAccesses = query.match(/\[[^\]]*\]/g) || [];
  metrics.maxArrayAccess = arrayAccesses.reduce((max, access) => {
    const depth = (access.match(/\d+/g) || []).reduce((sum, num) => sum + parseInt(num, 10), 0);
    return Math.max(max, depth);
  }, 0);

  return metrics;
}

/**
 * Validates query complexity against limits
 * @param {string} query - The jq query to validate
 * @returns {Object} Validation result
 */
function validateQueryComplexity(query) {
  const metrics = calculateQueryComplexity(query);

  if (metrics.pipeDepth > QUERY_LIMITS.MAX_PIPE_DEPTH) {
    return {
      success: false,
      error: `Query pipe depth ${metrics.pipeDepth} exceeds limit ${QUERY_LIMITS.MAX_PIPE_DEPTH}`
    };
  }

  if (metrics.filterCount > QUERY_LIMITS.MAX_FILTERS) {
    return {
      success: false,
      error: `Query filter count ${metrics.filterCount} exceeds limit ${QUERY_LIMITS.MAX_FILTERS}`
    };
  }

  if (metrics.operationCount > QUERY_LIMITS.MAX_OPERATIONS) {
    return {
      success: false,
      error: `Query operation count ${metrics.operationCount} exceeds limit ${QUERY_LIMITS.MAX_OPERATIONS}`
    };
  }

  if (metrics.hasRecursion) {
    return {
      success: false,
      error: 'Query contains recursive operations which are not allowed'
    };
  }

  if (metrics.maxArrayAccess > QUERY_LIMITS.MAX_ARRAY_SIZE) {
    return {
      success: false,
      error: `Query array access ${metrics.maxArrayAccess} exceeds limit ${QUERY_LIMITS.MAX_ARRAY_SIZE}`
    };
  }

  return { success: true };
}

/**
 * Validates JSON input string
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} Validation result with success/error
 */
// Second implementation removed to fix duplicate function definition

/**
 * Validates JSON input string
 * @param {string} jsonString - JSON string to validate
 * @returns {Object} Validation result with success/error
 */
function validateJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `Invalid JSON: ${error.message}`
    };
  }
}

export default tool({
  description: "Query JSON data using jq",
  args: {
    query: tool.schema.string().describe("jq query expression"),
    file: tool.schema.string().optional().describe("JSON file path"),
    input: tool.schema.string().optional().describe("JSON string input")
  },
  async execute(args) {
    try {
      safety.log(`Starting jq execution with query: ${args.query.substring(0, 100)}...`);

      let jsonInput;

      if (args.file) {
        // Validate file path for security
        const pathValidation = safety.validatePath(args.file);
        if (!pathValidation.success) {
          safety.log(`Path validation failed: ${pathValidation.error}`, 'error');
          return `Security error: ${pathValidation.error}`;
        }

        // Validate file existence and properties
        const fileValidation = safety.validateFile(pathValidation.resolvedPath);
        if (!fileValidation.success) {
          safety.log(`File validation failed: ${fileValidation.error}`, 'error');
          return `File error: ${fileValidation.error}`;
        }

        jsonInput = readFileSync(pathValidation.resolvedPath, 'utf-8');
        safety.log(`File loaded successfully: ${fileValidation.size} bytes`);
      } else if (args.input) {
        jsonInput = args.input;
        safety.log(`Using provided JSON input: ${jsonInput.length} characters`);
      } else {
        const errorMsg = "Either 'file' or 'input' must be provided";
        safety.log(errorMsg, 'error');
        return errorMsg;
      }

      // Validate JSON input
      const jsonValidation = validateJSON(jsonInput);
      if (!jsonValidation.success) {
        safety.log(`JSON validation failed: ${jsonValidation.error}`, 'error');
        return jsonValidation.error;
      }

      // Validate query complexity
      const complexityValidation = validateQueryComplexity(args.query);
      if (!complexityValidation.success) {
        safety.log(`Query complexity validation failed: ${complexityValidation.error}`, 'error');
        return complexityValidation.error;
      }

      safety.log('Validation passed, executing jq command');

      // Execute jq safely using spawnSync with array arguments to prevent injection
      const result = spawnSync('jq', [args.query], {
        input: jsonInput,
        encoding: 'utf-8',
        timeout: safety.config.commandTimeout
      });

      if (result.error) {
        const errorMsg = `jq execution failed: ${result.error.message}`;
        safety.log(errorMsg, 'error');
        return errorMsg;
      }

      if (result.status !== 0) {
        const errorMsg = `jq exited with code ${result.status}: ${result.stderr}`;
        safety.log(errorMsg, 'error');
        return errorMsg;
      }

      safety.log('jq command completed successfully');
      return result.stdout.trim();
    } catch (error) {
      const errorMsg = `Error: ${error.message}`;
      safety.log(`Execution failed: ${error.message}`, 'error');
      return errorMsg;
    }
  }
});
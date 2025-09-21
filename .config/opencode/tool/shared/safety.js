import { execSync } from "child_process";
import { existsSync, statSync, readFileSync } from "fs";
import { resolve, relative, sep } from "path";

/**
 * ToolSafety - Security module for OpenCode custom tools
 * Provides input sanitization, file validation, command execution protection,
 * and basic logging to prevent common security vulnerabilities.
 */
export class ToolSafety {
  constructor(toolName, config = {}) {
    this.toolName = toolName;
    this.config = {
      maxFileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
      commandTimeout: config.commandTimeout || 30000, // 30s default
      allowedPaths: config.allowedPaths || [], // Restricted paths
      logLevel: config.logLevel || 'info',
      maxMemoryMB: config.maxMemoryMB || 1024, // 1GB default
      maxCPUPercent: config.maxCPUPercent || 80, // 80% CPU limit
      rateLimit: {
        maxOperations: config.rateLimit?.maxOperations || 100,
        timeWindow: config.rateLimit?.timeWindow || 60000, // 1 minute
        operations: new Map() // Track operations
      },
      _operations: new Map(), // Internal operations tracker
      ...config
    };
  }

  /**
   * Validates file existence, size, and detects binary content
   * @param {string} filePath - Path to validate
   * @returns {Object} Validation result with success/error
   */
  validateFile(filePath) {
    try {
      if (!existsSync(filePath)) {
        return { success: false, error: `File not found: ${filePath}` };
      }

      const stats = statSync(filePath);

      if (stats.size > this.config.maxFileSize) {
        return {
          success: false,
          error: `File too large: ${stats.size} bytes (max: ${this.config.maxFileSize})`
        };
      }

      // Basic binary detection - check for null bytes in first 1KB
      const buffer = readFileSync(filePath, { encoding: null, flag: 'r' });
      const sampleSize = Math.min(1024, buffer.length);
      const sample = buffer.subarray(0, sampleSize);

      if (sample.includes(0)) {
        return {
          success: false,
          error: `Binary file detected: ${filePath}`
        };
      }

      this.log(`File validated: ${filePath} (${stats.size} bytes)`);
      return { success: true, size: stats.size };
    } catch (error) {
      return { success: false, error: `File validation failed: ${error.message}` };
    }
  }

  /**
   * Sanitizes input to prevent shell injection attacks
   * @param {string} input - Input string to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return String(input);
    }

    // Escape shell metacharacters instead of removing them
    return input.replace(/[;&|`$(){}[\]\\<>'"]/g, '\\$&');
  }

  /**
   * Executes command with timeout and logging protection
   * @param {string} command - Command to execute
   * @param {Object} options - Execution options
   * @returns {string} Command output
   */
   /**
    * Checks resource limits
    * @returns {Object} Check result with success/error
    */
   checkResourceLimits() {
     // Check memory usage
     const memUsage = process.memoryUsage();
     const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
     if (usedMB > this.config.maxMemoryMB) {
       return {
         success: false,
         error: `Memory limit exceeded: ${usedMB}MB used (max: ${this.config.maxMemoryMB}MB)`
       };
     }

     // Check CPU usage (requires 'os' module)
     const cpuUsage = process.cpuUsage();
     const cpuPercent = Math.round(
       (cpuUsage.user + cpuUsage.system) / 1000000 * 100
     );
     if (cpuPercent > this.config.maxCPUPercent) {
       return {
         success: false,
         error: `CPU limit exceeded: ${cpuPercent}% (max: ${this.config.maxCPUPercent}%)`
       };
     }

     return { success: true };
   }

   /**
    * Checks rate limits
    * @returns {Object} Check result with success/error
    */
    checkRateLimit() {
      const now = Date.now();
      const { maxOperations, timeWindow } = this.config.rateLimit;

      if (!this._operations) {
        this._operations = [];
      }

      // Clean up old entries
      this._operations = this._operations.filter(timestamp =>
        now - timestamp <= timeWindow
      );

      // Count recent operations
      const recentOps = this._operations.length;
      if (recentOps >= maxOperations) {
        return {
          success: false,
          error: `Rate limit exceeded: ${recentOps} operations in last ${timeWindow/1000}s`
        };
      }

      // Record this operation
      this._operations.push(now);
      return { success: true };
    }

   /**
    * Executes command with timeout, resource limits and rate limiting
    * @param {string} command - Command to execute
    * @param {Object} options - Execution options
    * @returns {string} Command output
    */
   executeCommand(command, options = {}) {
     // Check rate limits
     const rateCheck = this.checkRateLimit();
     if (!rateCheck.success) {
       this.log(rateCheck.error, 'error');
       throw new Error(rateCheck.error);
     }

     // Check resource limits
     const resourceCheck = this.checkResourceLimits();
     if (!resourceCheck.success) {
       this.log(resourceCheck.error, 'error');
       throw new Error(resourceCheck.error);
     }

     const safeOptions = {
       encoding: 'utf-8',
       timeout: this.config.commandTimeout,
       ...options
     };

     this.log(`Executing command: ${command}`);

     try {
       const result = execSync(command, safeOptions);
       this.log(`Command completed successfully`);
       return result;
     } catch (error) {
       this.log(`Command failed: ${error.message}`, 'error');
       throw error;
     }
   }

  /**
   * Validates path to prevent directory traversal attacks
   * @param {string} inputPath - Path to validate
   * @param {string} basePath - Base directory (defaults to cwd)
   * @returns {Object} Validation result
   */
  validatePath(inputPath, basePath = process.cwd()) {
    try {
      const resolvedPath = resolve(basePath, inputPath);
      const relativePath = relative(basePath, resolvedPath);

      // Check for path traversal (../ sequences)
      if (relativePath.startsWith('..') || relativePath.includes(`..${sep}`)) {
        return {
          success: false,
          error: `Path traversal detected: ${inputPath}`
        };
      }

      // Check against allowed paths if configured
      if (this.config.allowedPaths.length > 0) {
        const isAllowed = this.config.allowedPaths.some(allowedPath =>
          resolvedPath.startsWith(resolve(allowedPath))
        );

        if (!isAllowed) {
          return {
            success: false,
            error: `Path not in allowed directories: ${inputPath}`
          };
        }
      }

      return { success: true, resolvedPath };
    } catch (error) {
      return { success: false, error: `Path validation failed: ${error.message}` };
    }
  }

  /**
   * Logs messages with tool context and timestamp
   * @param {string} message - Message to log
   * @param {string} level - Log level (info, warn, error)
   */
  log(message, level = 'info') {
    if (this.config.logLevel === 'none') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.toolName}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}
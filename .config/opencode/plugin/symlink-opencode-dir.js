/**
 * Plugin that creates a symbolic link from ~/.config/opencode to .opencode in the current directory
 *
 * - Executes on application startup during plugin initialization
 * - Checks if .opencode exists in current working directory
 * - Creates symlink only if .opencode doesn't exist
 * - Silent operation with return codes: 0 for no action, 1 for symlink created
 */

import { existsSync, symlinkSync } from 'fs'
import { join, resolve } from 'path'
import { homedir } from 'os'

export const SymlinkOpencodeDir = async ({ app, client, $ }) => {
  let returnCode = 0

  try {
    const cwd = process.cwd()
    const opencodeLocal = join(cwd, '.opencode')
    const opencodeGlobal = resolve(homedir(), '.config', 'opencode')

    // Validate paths don't contain problematic characters
    if (opencodeLocal.includes('"') || opencodeLocal.includes("'") ||
        opencodeGlobal.includes('"') || opencodeGlobal.includes("'")) {
      // Invalid path characters detected - skip symlink creation
      return {}
    }

    // Check if .opencode exists in current directory (file, directory, or symlink)
    if (!existsSync(opencodeLocal)) {
      // Verify target directory exists before creating symlink
      if (existsSync(opencodeGlobal)) {
        // Create symbolic link from ~/.config/opencode to ./.opencode
        symlinkSync(opencodeGlobal, opencodeLocal, 'dir')
        returnCode = 1
      }
    }
  } catch (error) {
    // Silent failure - do nothing
  }

  // Store return code in process for potential external access
  if (typeof process !== 'undefined') {
    process.exitCode = returnCode
  }

  // Return empty hooks object as we don't need to listen to any events
  return {}
}
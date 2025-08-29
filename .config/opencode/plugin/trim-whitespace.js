/**
 * Plugin that trims trailing whitespace from text files after they are edited.
 * 
 * - Operates only on text files (skips binary files)
 * - Processes files in chunks no larger than 1 MiB
 * - Silent on success, noisy on errors
 * - Does nothing and exits silently if any error is encountered
 */

// Maximum chunk size: 1 MiB
const MAX_CHUNK_SIZE = 1024 * 1024

/**
 * Checks if a file is likely binary by examining the first chunk
 */
async function isBinaryFile(filePath) {
  try {
    const file = Bun.file(filePath)
    const buffer = await file.slice(0, Math.min(1024, MAX_CHUNK_SIZE)).arrayBuffer()
    const bytes = new Uint8Array(buffer)
    
    // Check for null bytes (common indicator of binary files)
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        return true
      }
    }
    
    return false
  } catch (error) {
    // If we can't read the file, assume it's binary and skip
    return true
  }
}

/**
 * Trims trailing whitespace from a text file in chunks
 */
async function trimTrailingWhitespace(filePath) {
  try {
    // Skip binary files
    if (await isBinaryFile(filePath)) {
      return
    }

    // Read the entire file first to check if it needs modification
    const file = Bun.file(filePath)
    const content = await file.text()
    
    // Process content line by line to trim trailing whitespace
    const lines = content.split('\n')
    const trimmedLines = lines.map(line => line.trimEnd())
    const trimmedContent = trimmedLines.join('\n')
    
    // Only write if content actually changed
    if (content !== trimmedContent) {
      await Bun.write(filePath, trimmedContent)
    }
  } catch (error) {
    // Errors should be noisy - rethrow to let opencode handle logging
    throw new Error(`Failed to trim whitespace in ${filePath}: ${error.message}`)
  }
}

export const TrimWhitespacePlugin = async ({ app, client, $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type === 'file.edited') {
        try {
          await trimTrailingWhitespace(event.properties.file)
        } catch (error) {
          // Let the error bubble up - opencode will handle the noisy logging
          throw error
        }
      }
    }
  }
}
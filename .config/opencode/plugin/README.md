# Symlink OpenCode Directory Plugin

This opencode plugin automatically creates a symbolic link from `~/.config/opencode` to `.opencode` in the current directory at startup.

## Features

- **Automatic Execution**: Runs during plugin initialization at startup
- **Idempotent**: Safe to run multiple times, won't overwrite existing configurations
- **Silent Operation**: Operates quietly with no output on success or failure
- **Cross-platform**: Uses Node.js fs module for compatibility

## Installation

1. Copy the plugin file to your opencode plugin directory:
   ```bash
   # For project-specific installation
   mkdir -p .opencode/plugin
   cp symlink-opencode-dir.js .opencode/plugin/

   # For global installation
   mkdir -p ~/.config/opencode/plugin
   cp symlink-opencode-dir.js ~/.config/opencode/plugin/
   ```

2. The plugin will automatically run when opencode starts

## How It Works

1. **Directory Check**: Checks if `.opencode` already exists in the current directory
2. **Symlink Creation**: Creates a symbolic link from `~/.config/opencode` to `./.opencode` using Node.js `symlinkSync`
3. **Silent Failure**: Any errors are silently caught to avoid disrupting startup

## Return Codes

- `0`: No action taken (`.opencode` already exists)
- `1`: Symlink successfully created

## Troubleshooting

### Plugin not running
- Verify the plugin file is in the correct directory (`.opencode/plugin/` or `~/.config/opencode/plugin/`)
- Ensure file has proper JavaScript syntax
- Check that `~/.config/opencode` exists

### Symlink not created
- Verify target directory exists: `ls -la ~/.config/opencode`
- Check permissions in current directory
- Remove any existing `.opencode` file/directory first

### Permission denied
- Ensure write permissions in the current directory
- Check if target directory is readable

## Development

### File Structure
```
plugin/
├── symlink-opencode-dir.js  # Main plugin file
└── README.md                # This documentation
```

### Testing
To test the plugin manually:
1. Remove any existing `.opencode` file/directory
2. Start opencode in a test directory
3. Check if symlink was created correctly: `ls -la .opencode`
4. Verify symlink points to `~/.config/opencode`
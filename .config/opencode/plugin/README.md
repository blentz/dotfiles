# Dotfiles Symlink Plugin

This opencode plugin automatically creates a symbolic link from `.opencode` to your dotfiles configuration directory at startup.

## Features

- **Early Execution**: Runs as close to startup as possible using both event hooks and tool execution hooks
- **Configurable Target**: Uses environment variable or sensible default
- **Idempotent**: Safe to run multiple times, won't overwrite existing configurations
- **Error Handling**: Graceful failure with detailed logging
- **Cross-platform**: Works on macOS and Linux systems

## Installation

1. Copy the plugin file to your opencode plugin directory:
   ```bash
   # For project-specific installation
   mkdir -p .opencode/plugin
   cp dotfiles-symlink.js .opencode/plugin/

   # For global installation
   mkdir -p ~/.config/opencode/plugin
   cp dotfiles-symlink.js ~/.config/opencode/plugin/
   ```

2. The plugin will automatically run when opencode starts

## Configuration

### Environment Variable

Set the `OPENCODE_DOTFILES_PATH` environment variable to customize the symlink target:

```bash
export OPENCODE_DOTFILES_PATH="~/my-dotfiles/.config/opencode"
```

### Default Behavior

If no environment variable is set, the plugin defaults to:
```
~/git/dotfiles/.config/opencode
```

## How It Works

1. **Startup Detection**: The plugin hooks into both event-based and tool-execution-based startup detection
2. **Existence Check**: Checks if `.opencode` already exists in the current directory
3. **Target Validation**: Verifies that the target directory exists before creating the symlink
4. **Symlink Creation**: Creates a symbolic link using the system's `ln -s` command
5. **Logging**: Provides detailed console output for debugging

## Plugin Hooks Used

- `event`: Listens for `session.start` and `app.start` events
- `tool.execute.before`: Backup execution path that runs before the first tool execution

## Error Handling

The plugin gracefully handles several error conditions:

- **Target doesn't exist**: Logs warning and skips symlink creation
- **Permission errors**: Logs error details without crashing
- **Existing `.opencode`**: Detects and skips if already present
- **System command failures**: Captures and logs stderr output

## Logging Output

All log messages are prefixed with `[dotfiles-symlink]` for easy identification:

```
[dotfiles-symlink] Creating symlink: /path/to/project/.opencode -> /home/user/git/dotfiles/.config/opencode
[dotfiles-symlink] Successfully created .opencode symlink
```

## Compatibility

- **Shell Requirements**: Uses standard Unix shell commands (`test`, `ln`)
- **Operating Systems**: macOS and Linux (requires symbolic link support)
- **opencode Version**: Compatible with opencode plugin system v0.1.x+

## Troubleshooting

### Plugin not running
- Verify the plugin file is in the correct directory (`.opencode/plugin/` or `~/.config/opencode/plugin/`)
- Check console output for error messages
- Ensure file has proper JavaScript syntax

### Symlink not created
- Verify target directory exists: `ls -la ~/git/dotfiles/.config/opencode`
- Check permissions in current directory
- Look for error messages in console output

### Permission denied
- Ensure write permissions in the current directory
- Check if target directory is readable
- Consider running with appropriate user permissions

## Development

### File Structure
```
plugin/
├── dotfiles-symlink.js     # JavaScript version
├── dotfiles-symlink.ts     # TypeScript version
└── README.md              # This documentation
```

### Testing
To test the plugin manually:
1. Remove any existing `.opencode` file/directory
2. Start opencode in a test directory
3. Check if symlink was created correctly
4. Verify symlink points to expected target
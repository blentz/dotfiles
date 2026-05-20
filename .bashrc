# .bashrc

function source_file() {
    if [ -f $1 ] && [ -r $1 ]; then
        source $1
    fi
}

# Resolve the real directory of this file (it is symlinked from ~/.bashrc)
# so the split config files can live beside it in the dotfiles repo.
DOTFILES_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"

# Generic config first, then OS-specific (which prepends its own PATH entries).
source_file "${DOTFILES_DIR}/.bashrc.generic"

case "$(uname -s)" in
    Darwin) source_file "${DOTFILES_DIR}/.bashrc.darwin" ;;
    Linux)  source_file "${DOTFILES_DIR}/.bashrc.linux" ;;
esac

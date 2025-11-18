# .bashrc
export BASH_SILENCE_DEPRECATION_WARNING=1
export HOMEBREW_PREFIX="/opt/homebrew"

function source_file() {
    if [ -f $1 ] && [ -r $1 ]; then
        source $1
    fi
}

if type brew &>/dev/null; then
    HOMEBREW_PREFIX="$(brew --prefix)"
    source_file "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh"
    for COMPLETION in $(\ls -1 ${HOMEBREW_PREFIX}/etc/bash_completion.d | \grep -E '\.(ba)?sh'); do
        source_file "$COMPLETION"
    done
fi

# install fzf completions if needed
[ -f ${HOMEBREW_PREFIX}/opt/fzf/install ] && [ ! -f $HOME/.fzf.bash ] && ${HOMEBREW_PREFIX}/opt/fzf/install

source_file "/etc/bashrc"

PYTHON_VERSION=$(python3 --version | awk '{split($2,a,"."); print a[1]"."a[2]}')

export GPG_TTY=$(tty)
export LC_ALL=en_US.UTF-8
export GOPATH=$HOME/.go

source_file "/etc/java/java.conf"
if [ ! -z "${JAVA_HOME}" ]; then
    export JAVA_HOME
fi

export HISTIGNORE="&:ls:[bf]g:exit"
export HISTCONTROL="ignoredups"
export HISTSIZE=16384
export HISTFILESIZE=16384
LAST_HISTORY_WRITE=$SECONDS
function save_history {
    if [[ $(($SECONDS - $LAST_HISTORY_WRITE)) > 60 ]]; then
        history -a && history -c && history -r
        LAST_HISTORY_WRITE=$SECONDS
    fi
}
PROMPT_COMMAND="${PROMPT_COMMAND} save_history"

# export PIP_TRUSTED_HOST='localhost'
# export PIPENV_PYPI_MIRROR="http://${PIP_TRUSTED_HOST}:3141/root/pypi/+simple/"

alias rmorig='find . -name "*.orig" -delete'
alias diff='diff -u'
alias git="${HOMEBREW_PREFIX}/bin/hub"
alias yum='/usr/bin/dnf'

alias ls="${HOMEBREW_PREFIX}/bin/lsd -F"
alias ll='ls -l'
alias la='ls -la'
export LSCOLORS='GxfxcxdxcxegedaBagabad'
alias grep="${HOMEBREW_PREFIX}/bin/ag"
alias less="less -R"

alias docker-rmi-untagged='docker rmi $(docker images -q -f "dangling=true")'
alias docker-rm-exited='docker rm -v $(docker ps -qa --no-trunc --filter "status=exited")'
alias podman-rmi-untagged='podman rmi $(podman images -q -f "dangling=true")'
alias podman-rm-exited='podman rm -v $(podman ps -qa --no-trunc --filter "status=exited")'

# alias devpi-run='podman run -d --name devpi --publish 3141:3141 \
#                             --volume /home/blentz/.devpi:/data:Z \
#                             --env=DEVPI_PASSWORD=redhat \
#                             --restart always \
#                             muccg/devpi || podman start devpi'

alias github-token="grep oauth_token /Users/brett.lentz/.config/gh/hosts.yml | awk '{print \$2}'"
alias gpom="git branch --list master main develop devel dev | tr -d '*' | xargs -n 1 git pull origin"

function set_kube_namespace() {
    kubectl config set-context --current --namespace="$1"
}

function rpmspec_download_upstream() {
    spectool -g -S $1
}

function rebaseupstream () {
  branch=prod
  if ! [[ -z "$1" ]]; then
    branch=$1
  fi

  startbranch=$(git describe --contains --all HEAD)
  git checkout $branch
  git fetch upstream
  git fetch upstream --tags
  git rebase upstream/$branch
  git push origin $branch
  git push origin --tags
  git checkout ${startbranch}
}

function update_env() {
    source $1 && export $(grep "^[^#;]" $1 | cut -d= -f1)
}

function tfmodup() {
    if [ -z $1 ]; then
        echo "usage: tfmodup modname 1.2.3"
        return
    fi
    grep -rl $1 | xargs gsed -i 's/'"${1}"'.git?ref.*/'"${1}"'.git?ref=v'"${2}"'\"/'
}

function gitbr() {
    git checkout -b $1 origin/$(git branch --list master main develop | tr -d '* ')
}

function diff-tfstate() {
    if [ -d $1 ] && [ -d $2 ]; then
        diff -r -x .git -x .terraform -x .terraform.lock.hcl -x README.md --color=always $1 $2
    else
        echo "usage: diff-tfstate dir1 dir2"
    fi
}

mcp_toggle() {
    local name="$1"
    local raw="${2:-true}"
    local cfg="${3:-$HOME/.config/opencode/opencode.json}"

    if ! command -v jq >/dev/null 2>&1; then
        echo "jq not found" >&2
        return 1
    fi

    local state
    case "$raw" in
        true|false)
            state="$raw"
            ;;
        enable|on|enabled)
            state=true
            ;;
        disable|off|disabled)
            state=false
            ;;
        *)
            echo "usage: mcp_toggle  <true|false|enable|disable> [config_path]" >&2
            return 2
            ;;
    esac

    local tmp="${cfg}.tmp.$$"
    mkdir -p "$(dirname "$cfg")"

    if [ ! -f "$cfg" ]; then
        printf '%s\n' '{ "mcp": {} }' >"$cfg"
    fi

    if jq --arg name "$name" --argjson state "$state"  '.mcp = (.mcp // {}) | .mcp[$name] = (.mcp[$name] // {}) | .mcp[$name].enabled = $state'  "$cfg" >"$tmp"; then
        mv "$tmp" "$cfg"
        echo "Set mcp.$name.enabled=$state in $cfg"
    else
        echo "Failed to update config" >&2
        rm -f "$tmp"
        return 3
    fi
}
alias mcp_status="jq -r '.mcp | to_entries[] | \"\(.key)\t\t\(.value.enabled // false)\"' /Users/blentz/.config/opencode/opencode.json"

export PATH="${HOMEBREW_PREFIX}/bin:${HOMEBREW_PREFIX}/opt/postgresql@15/bin:/usr/local/sbin:/usr/local/bin:$HOME/.pyenv/bin:$HOME/bin:$GOPATH:$GOPATH/bin:$PATH"

eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
eval "$(rbenv init -)"

export LDFLAGS="-L/usr/local/opt/zlib/lib -L/usr/local/opt/bzip2/lib"
export CPPFLAGS="-I/usr/local/opt/zlib/include -I/usr/local/opt/bzip2/include"

export DOCKER_CONFIG="${HOME}/.docker"
export HELM_REGISTRY_CONFIG="${DOCKER_CONFIG}/config.json"
export TF_LOG=WARN

alias mvim="open -a MacVim.app $1"
alias sort-launchpad="defaults write com.apple.dock ResetLaunchPad -bool true; killall Dock"

STARSHIP_INIT=$(starship init bash --print-full-init)
STARSHIP_COMPLETION=$(starship completions bash)
eval "${STARSHIP_INIT}"
eval "${STARSHIP_COMPLETION}"

[ -f ~/.fzf.bash ] && source ~/.fzf.bash

mcp_toggle() {
    local name="$1"
    local raw="${2:-true}"
    local cfg="${3:-$HOME/.config/opencode/opencode.json}"

    if ! command -v jq >/dev/null 2>&1; then
        echo "jq not found" >&2
        return 1
    fi

    local state
    case "$raw" in
        true|false)
            state="$raw"
            ;;
        enable|on|enabled)
            state=true
            ;;
        disable|off|disabled)
            state=false
            ;;
        *)
            echo "usage: mcp_toggle  <true|false|enable|disable> [config_path]" >&2
            return 2
            ;;
    esac

    local tmp="${cfg}.tmp.$$"
    mkdir -p "$(dirname "$cfg")"

    if [ ! -f "$cfg" ]; then
        printf '%s\n' '{ "mcp": {} }' >"$cfg"
    fi

    if jq --arg name "$name" --argjson state "$state"  '.mcp = (.mcp // {}) | .mcp[$name] = (.mcp[$name] // {}) | .mcp[$name].enabled = $state'  "$cfg" >"$tmp"; then
        mv "$tmp" "$cfg"
        echo "Set mcp.$name.enabled=$state in $cfg"
    else
        echo "Failed to update config" >&2
        rm -f "$tmp"
        return 3
    fi
}
alias mcp_status="jq -r '.mcp | to_entries[] | \"\(.key)\t\t\(.value.enabled // false)\"' /Users/blentz/.config/opencode/opencode.json"
# gcloud auth print-access-token | podman login -u oauth2accesstoken --password-stdin

# .bashrc

function source_file() {
    if [ -f $1 ]; then
        source $1
    fi
}

source_file "/etc/bashrc"
# source_file "${HOME}/bin/oc_completion.sh"

if type brew &>/dev/null; then
  HOMEBREW_PREFIX="$(brew --prefix)"
  if [[ -r "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh" ]]; then
    source "${HOMEBREW_PREFIX}/etc/profile.d/bash_completion.sh"
  else
    for COMPLETION in "${HOMEBREW_PREFIX}/etc/bash_completion.d/"*; do
      [[ -r "$COMPLETION" ]] && source "$COMPLETION"
    done
  fi
fi

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
alias git="/usr/local/bin/hub"
alias yum='/usr/bin/dnf'

alias ls='/usr/local/bin/lsd -F'
alias ll='ls -l'
alias la='ls -la'
export LSCOLORS="GxfxcxdxcxegedaBagabad"
alias grep='/usr/local/bin/ag'

alias docker-rmi-untagged='docker rmi $(docker images -q -f "dangling=true")'
alias docker-rm-exited='docker rm -v $(docker ps -qa --no-trunc --filter "status=exited")'
# alias podman-rmi-untagged='podman rmi $(podman images -q -f "dangling=true")'
# alias podman-rm-exited='podman rm -v $(podman ps -qa --no-trunc --filter "status=exited")'

# alias devpi-run='podman run -d --name devpi --publish 3141:3141 \
#                             --volume /home/blentz/.devpi:/data:Z \
#                             --env=DEVPI_PASSWORD=redhat \
#                             --restart always \
#                             muccg/devpi || podman start devpi'

alias github-token="grep oauth_token /Users/brett.lentz/.config/gh/hosts.yml | awk '{print \$2}'"
alias gpom="git branch --list master main develop | tr -d '*' | xargs -n 1 git pull origin"
alias ghpr="gh pr create -d -a @me -r Datatamer/devops"

function set_kube_namespace() {
    kubectl config set-context --current --namespace="$1"
}

function tamr_clone() {
    git clone git@github.com:Datatamer/$1
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
function tfgrep() {
    if [ -z $1 ]; then
        echo "usage: tfgrep [searchstring]"
        return
    fi
    ag -rl -G '\.*\.tf$' $1 ${HOME}/git/Datatamer
}
function yamlgrep() {
    if [ -z $1 ]; then
        echo "usage: yamlgrep [searchstring]"
        return
    fi
    ag -rl --yaml $1 ${HOME}/git/Datatamer
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


export PATH="/usr/local/sbin:/usr/local/bin:$HOME/.pyenv/bin:$HOME/bin:$GOPATH:$GOPATH/bin:$PATH"

eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
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

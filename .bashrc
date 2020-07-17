# .bashrc

function source_file() {
    if [ -f $1 ]; then
        source $1
    fi
}

source_file "/etc/bashrc"
source_file "${HOME}/bin/oc_completion.sh"

powerline-daemon -q
POWERLINE_BASH_CONTINUATION=1
POWERLINE_BASH_SELECT=1
source_file '/usr/share/powerline/bash/powerline.sh'

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
    if [ $(($SECONDS - $LAST_HISTORY_WRITE)) > 60 ]; then
        history -a && history -c && history -r
        LAST_HISTORY_WRITE=$SECONDS
    fi
}
PROMPT_COMMAND="${PROMPT_COMMAND} save_history"

export GOPATH=$HOME/.go
export PATH="$PATH:$HOME/bin:$GOPATH:$GOPATH/bin"

# export PIPENV_PYPI_MIRROR="http://devpi-devpi.$(minishift ip).nip.io/root/pypi/+simple/"
export PIP_TRUSTED_HOST='localhost'
export PIPENV_PYPI_MIRROR="http://${PIP_TRUSTED_HOST}:3141/root/pypi/+simple/"

alias gpa='CURR=`git branch | grep "\*" | tr -d "*"`; git fetch; for x in $(git branch -vv | grep origin | tr -d "*" | awk '\''{print $1}'\''); do git checkout $x && git rebase origin/${x}; done; git checkout ${CURR}'

alias rmorig='find . -name "*.orig" -delete'
alias diff='diff -u'
alias git="/usr/bin/hub"
alias yum='/usr/bin/dnf'

alias docker-rmi-untagged='docker rmi $(docker images -q -f "dangling=true")'
alias docker-rm-exited='docker rm -v $(docker ps -qa --no-trunc --filter "status=exited")'
alias podman-rmi-untagged='podman rmi $(podman images -q -f "dangling=true")'
alias podman-rm-exited='podman rm -v $(podman ps -qa --no-trunc --filter "status=exited")'

function rpmspec-download-upstream() {
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

function update-env() {
    source $1 && export $(cut -d= -f1 $1)
}

# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
    . /etc/bashrc
fi

# Source bash_completion bits
if [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
fi

if [ -f /etc/java/java.conf ]; then
    . /etc/java/java.conf
    if [ ! -z "${JAVA_HOME}" ]; then
        export JAVA_HOME
    fi
fi

if [ -f ~/bin/oc_completion.sh ]; then
    . ~/bin/oc_completion.sh
fi

GRAY="\[\033[1;30m\]"
LIGHT_GRAY="\[\033[0;37m\]"
CYAN="\[\033[0;36m\]"
LIGHT_CYAN="\[\033[1;36m\]"
NO_COLOUR="\[\033[0m\]"
RED='\[\033[0;31m\]'
YELLOW="\[\033[1;33m\]"
GREEN="\[\033[0;32m\]"

if [ -f /usr/share/bash-completion/completions/git ]; then
    source /usr/share/bash-completion/completions/git
    source /usr/share/git-core/contrib/completion/git-prompt.sh

    GIT_PS1_SHOWDIRTYSTATE=true
    GIT_PS1_SHOWUNTRACKEDFILES=true
    GIT_PS1_SHOWSTASHSTATE=true

    PROMPT_COMMAND='PS1="$LIGHT_GRAY[$CYAN\u$LIGHT_GRAY@$CYAN\h $YELLOW\W${GREEN}$(declare -F __git_ps1 &>/dev/null && __git_ps1 " (%s)")$LIGHT_GRAY]$RED\$ $NO_COLOUR"'
else
    PROMPT_COMMAND='PS1="$LIGHT_GRAY[$CYAN\u$LIGHT_GRAY@$CYAN\h $YELLOW\W$LIGHT_GRAY]$RED\$ $NO_COLOUR"'
fi

# User specific aliases and functions
export HISTIGNORE="&:ls:[bf]g:exit"
export HISTCONTROL="ignoredups"
export HISTSIZE=1048576
export HISTFILESIZE=1048576

LAST_HISTORY_WRITE=$SECONDS
function prompt_command {
    if [ $(($SECONDS - $LAST_HISTORY_WRITE)) -gt 60 ]; then
        history -a && history -c && history -r
        LAST_HISTORY_WRITE=$SECONDS
    fi
}
PROMPT_COMMAND="$PROMPT_COMMAND; prompt_command"

export GOPATH=$HOME/.go
export PATH="$PATH:~/bin:$GOPATH:$GOPATH/bin

alias gpa='CURR=`git branch | grep "\*" | tr -d "*"`; git fetch; for x in $(git branch -vv | grep origin | tr -d "*" | awk '\''{print $1}'\''); do git checkout $x && git rebase origin/${x}; done; git checkout ${CURR}'
alias rmorig='find . -name "*.orig" -delete'
alias diff='diff -u'
alias git="${HOME}/bin/hub"
alias yum='/usr/bin/dnf'
alias mutt='/usr/bin/neomutt'

alias docker-rmi-untagged='docker rmi $(docker images | grep "^<none>" | awk '"'"'{print $3}'"'"')'
alias docker-rm-exited='docker rm $(docker ps -qa --no-trunc --filter "status=exited")'

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

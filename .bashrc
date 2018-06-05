# .bashrc

function source_file() {
    if [ -f $1 ]; then
        source $1
    fi
}

source_file '/etc/bashrc'
source_file '/etc/bash_completion'
source_file '/etc/java/java.conf'
source_file ${HOME}/bin/oc_completion.sh

powerline-daemon -q
POWERLINE_BASH_CONTINUATION=1
POWERLINE_BASH_SELECT=1
source_file '/usr/share/powerline/bash/powerline.sh'

if [ ! -z "${JAVA_HOME}" ]; then
    export JAVA_HOME
fi

export HISTIGNORE="&:ls:[bf]g:exit"
export HISTCONTROL="ignoredups"
export HISTSIZE=16384
export HISTFILESIZE=16384
LAST_HISTORY_WRITE=$SECONDS
function prompt_command {
    if [ $(($SECONDS - $LAST_HISTORY_WRITE)) -gt 60 ]; then
        history -a && history -c && history -r
        LAST_HISTORY_WRITE=$SECONDS
    fi
}
PROMPT_COMMAND="$PROMPT_COMMAND; prompt_command"

export GOPATH=$HOME/.go
export PATH="$PATH:~/bin:$GOPATH:$GOPATH/bin"

alias gpa='CURR=`git branch | grep "\*" | tr -d "*"`; git fetch; for x in $(git branch -vv | grep origin | tr -d "*" | awk '\''{print $1}'\''); do git checkout $x && git rebase origin/${x}; done; git checkout ${CURR}'

alias rmorig='find . -name "*.orig" -delete'
alias diff='diff -u'
alias git="${HOME}/bin/hub"
alias yum='/usr/bin/dnf'
alias mutt='/usr/bin/neomutt'

alias docker-rmi-untagged='docker rmi $(docker images -q -f "dangling=true")'
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

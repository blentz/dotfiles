
# FIXME: some repos have a "main" branch, some have "master"
MAIN_REPOS = ops-ansible ansible-okta-agent
MASTER_REPOS = tf-gcp-cus-hosted tf-gcp-networking-core tf-gcp-org-tamr-com tf-gcp-tamr tf-ops-okta

EXECUTABLES = git gh ansible-playbook gcloud
x := $(foreach exec,$(EXECUTABLES),\
        $(if $(shell command -v $(exec)),foo,$(error "No $(exec) in PATH")))

help:
	@echo "Available Commands:"
	@echo "    setup        - Run this after cloning the repository."
	@echo "    test         - Do a syntax check"
	@echo "    reset-sub    - does 'git reset --hard' on submodules"
	@echo "    update-sub   - does 'git pull' on submodules"
	@echo "    pr-meta      - create pull request for changed submodules"
	@echo "    deploy       - execute all playbooks, deploy a hosted customer"
	@echo "    deploy-step1 - execute step1 playbook, deploy a hosted customer"
	@echo "    deploy-step2 - execute step2 playbook, install Tamr for hosted customer"
	@echo "    print-vars   - For debugging"

setup:
	git config push.recurseSubmodules check
#	git config status.submodulesummary=1
	git config diff.submodule log
	git submodule update --init --remote --rebase --recursive

test:
	ansible-playbook -vvv --syntax-check -i ./ops-ansible/inventory/cus/hosting.gcp.yml -e @customer.yaml step1.yaml
	ansible-playbook -vvv --syntax-check -i ./ops-ansible/inventory/cus/hosting.gcp.yml -e @customer.yaml step2.yaml

reset-sub:
	git submodule foreach git reset --hard
	git submodule foreach git reset --hard

update-sub:
	git fetch origin --recurse-submodules=yes
	git submodule update --remote --rebase

deploy: deploy-step1 deploy-step2

deploy-step1:
	ansible-playbook -vvv -i ./ops-ansible/inventory/cus/hosting.gcp.yml -e @customer.yaml step2.yaml | tee logs/`date "+%Y-%m-%d-%H.%M.%S"`-step2.log

deploy-step2:
	ansible-playbook -vvv -i ./ops-ansible/inventory/cus/hosting.gcp.yml -e @customer.yaml step2.yaml | tee logs/`date "+%Y-%m-%d-%H.%M.%S"`-step2.log

print-vars:
	ansible-playbook -i ./ops-ansible/inventory/cus/hosting.gcp.yml -e @customer.yaml debug.yaml

pr-meta: update-sub
	git checkout -b 'submodule-update' origin/main
	git add $(MAIN_REPOS) $(MASTER_REPOS)
	git commit -m 'update submodule references'
	gh pr create -d -a '@me' -r 'Datatamer/devops' -t 'update submodule references' -b 'updating submodule references'
	@echo "After PR is merged, please delete the "submodule-update" branch."

#!/bin/bash -ex

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DASHBOARD_FRONTEND_DIR=${SCRIPT_DIR}/../../../src/pybind/mgr/dashboard/frontend

[ -z "$SUDO" ] && SUDO=sudo

install_common () {
    if grep -q  debian /etc/*-release; then
        $SUDO apt-get update
        $SUDO apt-get install -y jq npm
    elif grep -q rhel /etc/*-release; then
        $SUDO yum install -y jq npm
    else
        echo "Unsupported distribution."
        exit 1
    fi
}

install_chrome () {
    if grep -q  debian /etc/*-release; then
        $SUDO bash -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list'
        curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | $SUDO apt-key add -
        $SUDO apt-get update
        $SUDO apt-get install -y google-chrome-stable
        $SUDO apt-get install -y xvfb
        $SUDO rm /etc/apt/sources.list.d/google-chrome.list
    elif grep -q rhel /etc/*-release; then
        $SUDO dd of=/etc/yum.repos.d/google-chrome.repo status=none <<EOF
[google-chrome]
name=google-chrome
baseurl=https://dl.google.com/linux/chrome/rpm/stable/\$basearch
enabled=1
gpgcheck=1
gpgkey=https://dl-ssl.google.com/linux/linux_signing_key.pub
EOF
        $SUDO yum install -y google-chrome-stable
        $SUDO rm /etc/yum.repos.d/google-chrome.repo
        $SUDO yum install -y xorg-x11-server-Xvfb.x86_64
    else
        echo "Unsupported distribution."
        exit 1
    fi
}

cypress_run () {
    local specs="$1"
    local timeout="$2"
    local override_config="testFiles=${specs}"

    if [ x"$timeout" != "x" ]; then
        override_config="${override_config},defaultCommandTimeout=${timeout}"
    fi
    npx cypress run --browser chrome --headless --config "$override_config"
}

install_common
install_chrome

CYPRESS_BASE_URL=$(ceph mgr services | jq -r .dashboard)
export CYPRESS_BASE_URL
export CYPRESS_WITH_ORCHESTRATOR=true

cd $DASHBOARD_FRONTEND_DIR

# This is required for Cypress to understand typescript
npm ci --unsafe-perm
npx cypress info

# Take `orch device ls` as ground truth.
ceph orch device ls --refresh
sleep 10  # the previous call is asynchronous
ceph orch device ls --format=json | tee cypress/fixtures/orchestrator/inventory.json

ceph dashboard ac-user-set-password admin admin --force-password

# Run Dashboard e2e tests.
# These tests are designed with execution order in mind, since orchestrator operations
# are likely to change cluster state, we can't just run tests in arbitrarily order.
# See /ceph/src/pybind/mgr/dashboard/frontend/cypress/integration/orchestrator/ folder.
find cypress
cypress_run "orchestrator/01-hosts.e2e-spec.ts"

# Hosts are removed and added in the previous step. Do a refresh again.
ceph orch device ls --refresh
sleep 10
ceph orch device ls --format=json | tee cypress/fixtures/orchestrator/inventory.json

cypress_run "orchestrator/02-hosts-inventory.e2e-spec.ts"
cypress_run "orchestrator/03-inventory.e2e-spec.ts"
cypress_run "orchestrator/04-osds.e2e-spec.ts" 300000

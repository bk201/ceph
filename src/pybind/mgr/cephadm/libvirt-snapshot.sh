#!/bin/bash -e

VM_PREFIX=$(basename $(pwd))
MACHINES=$(ls .vagrant/machines)

CMD=$1

if [ x"${CMD}" = "x" ]; then
    CMD="list"
fi

create_snapshots() {
    for MACHINE in ${MACHINES}; do
        VM_DOMAIN="${VM_PREFIX}_${MACHINE}"
        if virsh snapshot-current $VM_DOMAIN &> /dev/null ; then
            echo "${VM_DOMAIN} already has a current snapshot."
        else
            virsh snapshot-create $VM_DOMAIN
        fi
    done
}

revert_snapshots() {
    for MACHINE in ${MACHINES}; do
        VM_DOMAIN="${VM_PREFIX}_${MACHINE}"
        if virsh snapshot-current $VM_DOMAIN &> /dev/null ; then
            set +o errexit
            virsh destroy ${VM_DOMAIN}
            set -o errexit
            virsh snapshot-revert ${VM_DOMAIN} --current
        else
            echo "${VM_DOMAIN} has no current snapshot."
        fi
    done
}

remove_snapshots() {
    for MACHINE in ${MACHINES}; do
        VM_DOMAIN="${VM_PREFIX}_${MACHINE}"
        set +o errexit
        CURRENT=$(virsh snapshot-current $VM_DOMAIN 2>/dev/null)
        if [ $? -eq 0 ]; then
            virsh snapshot-delete ${VM_DOMAIN} --current
        else
            echo "${VM_DOMAIN} has no current snapshot."
        fi
        set -o errexit
    done
}

list_snapshots() {
    for MACHINE in ${MACHINES}; do
        VM_DOMAIN="${VM_PREFIX}_${MACHINE}"
        set +o errexit
        CURRENT=$(virsh snapshot-current $VM_DOMAIN 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo $CURRENT
        else
            echo "${VM_DOMAIN} has no current snapshot."
        fi
        set -o errexit
    done
}

case "${CMD}" in
create)
    create_snapshots
    ;;
remove)
    remove_snapshots
    ;;
list)
    list_snapshots 
    ;;
revert)
    revert_snapshots 
    ;;
*)
    echo "Unknow command."
    exit 1
esac


# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

from . import ApiController, Endpoint, ReadPermission
from . import RESTController, Task
from .. import mgr
from ..security import Scope
from ..services.orchestrator import OrchClient
from ..tools import wraps


def get_device_osd_map():
    """Get mappings from inventory devices to OSD IDs.

    :return: Returns a dictionary containing mappings.
        e.g. {'node1': {'vdc': 2, 'vdb': 1}, 'node2': {'vdc': 0}}
    :rtype: dict
    """
    device_osd_map = {}
    for osd_id, osd_metadata in mgr.get('osd_metadata').items():
        hostname = osd_metadata['hostname']
        devices = osd_metadata.get('devices')
        if not devices:
            continue
        if hostname not in device_osd_map:
            device_osd_map[hostname] = {}
        # for OSD contains multiple devices, devices is in `sda,sdb`
        for device in devices.split(','):
            device_osd_map[hostname][device] = int(osd_id)
    return device_osd_map


def orchestrator_task(name, metadata, wait_for=2.0):
    return Task("orchestrator/{}".format(name), metadata, wait_for)


def raise_if_no_orchestrator(method):
    @wraps(method)
    def inner(self, *args, **kwargs):
        orch = OrchClient.instance()
        if not orch.available():
            raise cherrypy.HTTPError(503)
        return method(self, *args, **kwargs)
    return inner


@ApiController('/orchestrator')
class Orchestrator(RESTController):

    @Endpoint()
    @ReadPermission
    def status(self):
        return OrchClient.instance().status()


@ApiController('/orchestrator/inventory', Scope.HOSTS)
class OrchestratorInventory(RESTController):

    @raise_if_no_orchestrator
    def list(self, hostname=None):
        orch = OrchClient.instance()
        hosts = [hostname] if hostname else None
        inventory_nodes = [node.to_json() for node in orch.inventory.list(hosts)]
        device_osd_map = get_device_osd_map()
        for inventory_node in inventory_nodes:
            osds = device_osd_map.get(inventory_node['name'])
            for device in inventory_node['devices']:
                if osds:
                    device['osd_id'] = osds.get(device['id'])
                else:
                    device['osd_id'] = None
        return inventory_nodes


@ApiController('/orchestrator/service', Scope.HOSTS)
class OrchestratorService(RESTController):

    @raise_if_no_orchestrator
    def list(self, hostname=None):
        orch = OrchClient.instance()
        return [service.to_json() for service in orch.services.list(None, None, hostname)]

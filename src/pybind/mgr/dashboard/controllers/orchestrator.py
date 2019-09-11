# -*- coding: utf-8 -*-
from __future__ import absolute_import

import cherrypy

from . import ApiController, Endpoint, ReadPermission
from . import RESTController, Task
from .. import mgr, logger
from ..security import Scope
from ..services.orchestrator import OrchClient
from ..tools import wraps


def get_device_osd_map():
    """
    {'node1': {'vdc': '2', 'vdb': '1'}, 'node2': {'vdc': '0'}}
    """
    device_osd_map = {}
    for osd_id, osd_metadata in mgr.get('osd_metadata').items():
        hostname = osd_metadata['hostname']
        devices = osd_metadata['devices']
        if not devices:
            continue
        if hostname not in device_osd_map:
            device_osd_map[hostname] = {}
        # TODO: multiple devices for an OSD?
        device_osd_map[hostname][devices] = osd_id
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
        logger.info('kf: %s', device_osd_map)
        for inventory_node in inventory_nodes:
            osds = device_osd_map.get(inventory_node['name'])
            if not osds:
                for device in inventory_node['devices']:
                    device['osd_id'] = ""
                continue
            for device in inventory_node['devices']:
                osd_id = osds.get(device['id'], "")
                device['osd_id'] = osd_id
        return inventory_nodes


@ApiController('/orchestrator/service', Scope.HOSTS)
class OrchestratorService(RESTController):

    @raise_if_no_orchestrator
    def list(self, hostname=None):
        orch = OrchClient.instance()
        return [service.to_json() for service in orch.services.list(None, None, hostname)]

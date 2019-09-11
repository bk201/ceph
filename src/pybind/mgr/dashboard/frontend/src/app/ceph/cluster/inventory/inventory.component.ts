import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { OrchestratorService } from '../../../shared/api/orchestrator.service';
import { TableComponent } from '../../../shared/datatable/table/table.component';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableFetchDataContext } from '../../../shared/models/cd-table-fetch-data-context';
import { CephReleaseNamePipe } from '../../../shared/pipes/ceph-release-name.pipe';
import { DimlessBinaryPipe } from '../../../shared/pipes/dimless-binary.pipe';
import { SummaryService } from '../../../shared/services/summary.service';
import { Device, InventoryNode } from './inventory.model';
import { CdTableAction } from '../../../shared/models/cd-table-action';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';
import { ActionLabelsI18n } from '../../../shared/constants/app.constants';
import { Icons } from '../../../shared/enum/icons.enum';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';
import { Permissions } from '../../../shared/models/permissions';

@Component({
  selector: 'cd-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnChanges, OnInit {
  @ViewChild(TableComponent, { static: false })
  table: TableComponent;

  @Input() hostname = '';

  checkingOrchestrator = true;
  orchestratorExist = false;
  docsUrl: string;

  permissions: Permissions;
  columns: Array<CdTableColumn> = [];
  devices: Array<Device> = [];
  tableActions: CdTableAction[];
  selection = new CdTableSelection();
  isLoadingDevices = false;

  constructor(
    private authStorageService: AuthStorageService,
    private cephReleaseNamePipe: CephReleaseNamePipe,
    private dimlessBinary: DimlessBinaryPipe,
    private i18n: I18n,
    private actionLabels: ActionLabelsI18n,
    private orchService: OrchestratorService,
    private summaryService: SummaryService
  ) {
    this.permissions = this.authStorageService.getPermissions();
    this.tableActions = [
      {
        name: this.i18n('Create OSD'),
        permission: 'create',
        icon: Icons.add,
        // routerLink: () => this.urlBuilder.getAdd(),
        click: () => this.createOSD(),
        disable: () => !this.orchestratorExist || !this.selection.hasSelection || this.selection.first().osd_id !== '',
        disableDesc: () => this.getDisableDesc(),
        canBePrimary: () => this.selection.hasSelection && this.selection.first().osd_id === ''
      },
      {
        name: this.i18n('Remove OSD'),
        permission: 'delete',
        icon: Icons.destroy,
        click: () => this.removeOSD(),
        disable: () => !this.orchestratorExist || !this.selection.hasSelection || this.selection.first().osd_id === '',
        disableDesc: () => this.getDisableDesc(),
        canBePrimary: () => this.selection.hasSelection && this.selection.first().osd_id !== ''
      }
    ];
  }

  ngOnInit() {
    this.columns = [
      {
        name: this.i18n('Device path'),
        prop: 'id',
        flexGrow: 1
      },
      {
        name: this.i18n('Type'),
        prop: 'type',
        flexGrow: 1
      },
      {
        name: this.i18n('Size'),
        prop: 'size',
        flexGrow: 1,
        pipe: this.dimlessBinary
      },
      {
        name: this.i18n('Rotates'),
        prop: 'rotates',
        flexGrow: 1
      },
      {
        name: this.i18n('Available'),
        prop: 'available',
        flexGrow: 1
      },
      {
        name: this.i18n('Model'),
        prop: 'model',
        flexGrow: 1
      },
      {
        name: this.i18n('OSD ID'),
        prop: 'osd_id',
        flexGrow: 1
      }
    ];

    if (!this.hostname) {
      const hostColumn = {
        name: this.i18n('Hostname'),
        prop: 'hostname',
        flexGrow: 1
      };
      this.columns.splice(0, 0, hostColumn);
    }

    // duplicated code with grafana
    const subs = this.summaryService.subscribe((summary: any) => {
      if (!summary) {
        return;
      }

      const releaseName = this.cephReleaseNamePipe.transform(summary.version);
      this.docsUrl = `http://docs.ceph.com/docs/${releaseName}/mgr/orchestrator_cli/`;

      setTimeout(() => {
        subs.unsubscribe();
      }, 0);
    });

    this.orchService.status().subscribe((data: { available: boolean }) => {
      this.orchestratorExist = data.available;
      this.checkingOrchestrator = false;
    });
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  ngOnChanges() {
    if (this.orchestratorExist) {
      this.devices = [];
      this.table.reloadData();
    }
  }

  getInventory(context: CdTableFetchDataContext) {
    if (this.isLoadingDevices) {
      return;
    }
    this.isLoadingDevices = true;
    this.orchService.inventoryList(this.hostname).subscribe(
      (data: InventoryNode[]) => {
        const devices: Device[] = [];
        data.forEach((node: InventoryNode) => {
          node.devices.forEach((device: Device) => {
            device.hostname = node.name;
            device.uid = `${node.name}-${device.id}`;
            devices.push(device);
          });
        });
        this.devices = devices;
        this.isLoadingDevices = false;
      },
      () => {
        this.isLoadingDevices = false;
        this.devices = [];
        context.error();
      }
    );
  }

  createOSD() {

  }

  removeOSD() {

  }

  getDisableDesc() {
    return '';
  }
}

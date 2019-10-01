import { Component, OnInit } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';
import { ActionLabelsI18n } from '../../../../shared/constants/app.constants';
import { CdFormGroup } from '../../../../shared/forms/cd-form-group';
import { FormControl } from '@angular/forms';
import { OsdFeature } from './osd-feature.interface';
import * as _ from 'lodash';
import { OsdFormData } from './osd-form-data';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { CdTableFetchDataContext } from '../../../../shared/models/cd-table-fetch-data-context';
import { OrchestratorService } from '../../../../shared/api/orchestrator.service';
import { InventoryNode, Device } from '../../inventory/inventory.model';
import { DimlessBinaryPipe } from '../../../../shared/pipes/dimless-binary.pipe';
import { Icons } from '../../../../shared/enum/icons.enum';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { OsdSharedDevicesModalComponent } from '../osd-shared-devices-modal/osd-shared-devices-modal.component';
import { stringLiteral } from '@babel/types';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


@Component({
  selector: 'cd-osd-form',
  templateUrl: './osd-form.component.html',
  styleUrls: ['./osd-form.component.scss']
})
export class OsdFormComponent implements OnInit {
  debug = false;

  icons = Icons;

  osdForm: CdFormGroup;
  columns: Array<CdTableColumn> = [];

  loading = false;
  data = new OsdFormData(this.i18n);
  allDevices: Device[] = [];
  freeDevices: Device[] = [];
  dataDevices: Device[] = [];
  dbDevices: Device[] = [];
  walDevices: Device[] = [];
  filters = [];
  dataDeviceFilters = [];
  dbDeviceFilters = [];
  walDeviceFilters = [];
  hostname = '';
  driveGroupSpec = {};

  filterToDriveSelectionMap = {
    vendor: 'vendor',
    model: 'id_model',
    rotates: 'rotates',
    size: 'size'
  }
  
  action: string;
  resource: string;

  features: { [key: string]: OsdFeature };
  featureList: OsdFeature[] = [];

  constructor(
    public actionLabels: ActionLabelsI18n,
    private bsModalService: BsModalService,
    private dimlessBinary: DimlessBinaryPipe,
    private i18n: I18n,
    private orchService: OrchestratorService
  ) {
    this.resource = this.i18n('OSDs');
    this.action = this.actionLabels.CREATE;
    this.features = {
      encrypted: {
        key: 'encrypted',
        desc: 'Encryption'
      }
    }
    this.featureList = _.map(this.features, (o, key) => Object.assign(o, { key: key }));
    this.createForm();
  }

  ngOnInit() {
    // duplicated, need to reuse
    this.columns = [
      {
        name: this.i18n('Hostname'),
        prop: 'hostname',
        flexGrow: 1
      },
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
        name: this.i18n('Rotates'),
        prop: 'rotates',
        flexGrow: 1
      },
      {
        name: this.i18n('Vendor'),
        prop: 'vendor',
        flexGrow: 1
      },
      {
        name: this.i18n('Model'),
        prop: 'model',
        flexGrow: 1
      },
      {
        name: this.i18n('Size'),
        prop: 'size',
        flexGrow: 1,
        pipe: this.dimlessBinary
      },
    ];

    this.getDataDevices();

    _.each(this.features, (feature) => {
      this.osdForm
        .get('features')
        .get(feature.key)
        .valueChanges.subscribe((value) => this.featureFormUpdate(feature.key, value));
    });
  }

  createForm() {
    this.osdForm = new CdFormGroup(
      {

        enableDbDevices: new FormControl(false),
        dbSlots: new FormControl(0, { updateOn: 'blur' }),
        walSlots: new FormControl(0, { updateOn: 'blur' }),
        features: new CdFormGroup(
          this.featureList.reduce((acc, e) => {
            acc[e.key] = new FormControl({ value: false, disabled: true });
            return acc;
          }, {})
        )
      }
    )
  }

  getDataDevices() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.orchService.inventoryList('').subscribe(
      (data: InventoryNode[]) => {
        const devices: Device[] = [];
        data.forEach((node: InventoryNode) => {
          node.devices.forEach((device: Device) => {
            device.hostname = node.name;
            device.uid = `${node.name}-${device.id}`;
            if (device.dev_id) {
              device.vendor = device.dev_id.split('/')[0];
              device.model = device.dev_id.split('/')[1];
            }
            if (device.available) {
              devices.push(device);
            }
          });
        });
        this.allDevices = devices;
        this.freeDevices = [...devices];
        this.loading = false;
      },
      () => {
        this.allDevices = [];
        this.freeDevices = [];
        this.loading = false;
      }
    );
  }

  submit() {}

  updateSharedDevices() {
    // reset all selected shared devices when data device filters are changed
    this.dbDevices = [];
    this.walDevices = [];

    // determine free devices can be used as shared devices
    // without hostname (all host): all free devices (how about free devices are not same between hosts?) 
    // with hostname: any free devices on that host can be used.
    if (this.hostname !== '') {
      this.freeDevices = this.freeDevices.filter((device: Device) => {
        return device.hostname === this.hostname;
      });
    }
  }

  updateDriveGroup() {

  }

  showDataDevicesModal() {
    const options: ModalOptions = {
      class: 'modal-xl',
      initialState: {
        deviceType: 'data',
        devices: this.freeDevices
      }
    }
    const modalRef = this.bsModalService.show(OsdSharedDevicesModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.dataDevices = result.filteredDevices;
      this.freeDevices = result.freeDevices;
      this.dbDevices = [];
      this.walDevices = [];
      this.hostname = '';
      const hostnameFilter = _.find(result.appliedFilters, {'prop': 'hostname'})
      if (hostnameFilter) {
        this.hostname = hostnameFilter.value;
        this.freeDevices = this.freeDevices.filter((device: Device) => {return device.hostname === this.hostname});
      }
      this.dataDeviceFilters = result.appliedFilters;
      this.driveGroupSpec['host_pattern'] = this.hostname === '' ? '*': this.hostname;
      let deviceSelection = {}
      this.dataDeviceFilters.forEach((filter) => {
        if (this.filterToDriveSelectionMap[filter.prop]) {
          deviceSelection[this.filterToDriveSelectionMap[filter.prop]] = filter.value;
        }
      });
      this.driveGroupSpec['data_devices'] = deviceSelection;
      this.enableFeatures();
      console.log(this.driveGroupSpec);
    });
  }

  showDbDevicesModal() {
    const options: ModalOptions = {
      class: 'modal-xl',
      initialState: {
        hostname: this.hostname,
        deviceType: 'DB',
        devices: this.freeDevices
      }
    }
    const modalRef = this.bsModalService.show(OsdSharedDevicesModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.dbDevices = result.filteredDevices;
      this.freeDevices = result.freeDevices;
      this.dbDeviceFilters = result.appliedFilters;
      let deviceSelection = {}
      this.dbDeviceFilters.forEach((filter) => {
        if (this.filterToDriveSelectionMap[filter.prop]) {
          deviceSelection[this.filterToDriveSelectionMap[filter.prop]] = filter.value;
        }
      });
      this.driveGroupSpec['db_devices'] = deviceSelection;
    });
  }

  showWalDevicesModal() {
    const options: ModalOptions = {
      class: 'modal-xl',
      initialState: {
        hostname: this.hostname,
        deviceType: 'WAL',
        devices: this.freeDevices
      }
    }
    const modalRef = this.bsModalService.show(OsdSharedDevicesModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.walDevices = result.filteredDevices;
      this.freeDevices = result.freeDevices;
      this.walDeviceFilters = result.appliedFilters;
      let deviceSelection = {}
      this.walDeviceFilters.forEach((filter) => {
        if (this.filterToDriveSelectionMap[filter.prop]) {
          deviceSelection[this.filterToDriveSelectionMap[filter.prop]] = filter.value;
        }
      });
      this.driveGroupSpec['wal_devices'] = deviceSelection;
    });
  }

  clearDataDevices() {
    console.log('abc');
    // this.getDataDevices();
    this.freeDevices = [...this.allDevices];
    this.dataDevices = [];
    this.dbDevices = [];
    this.walDevices = [];
    this.driveGroupSpec = {};
    this.disableFeatures();
    this.dataDeviceFilters = [];
    this.dbDeviceFilters = [];
    this.walDeviceFilters = [];
  }

  clearDbDevices() {
    this.freeDevices = this.freeDevices.concat([...this.dbDevices]);
    this.dbDevices = [];
    delete this.driveGroupSpec['db_devices'];
    this.dbDeviceFilters = [];
  }

  clearWalDevices() {
    this.freeDevices = this.freeDevices.concat([...this.walDevices]);
    this.walDevices = [];
    delete this.driveGroupSpec['wal_devices'];
    this.walDeviceFilters = [];
  }

  featureFormUpdate(key: string, checked: boolean) {
    if (checked) {
      this.driveGroupSpec[key] = checked;
    } else {
      delete this.driveGroupSpec[key];
    }
  }

  enableFeatures() {
    this.featureList.forEach((feature) => {
      this.osdForm.get(feature.key).enable({ emitEvent: false })
    });
  }

  disableFeatures() {
    this.featureList.forEach((feature) => {
      const control = this.osdForm.get(feature.key)
      control.disable({ emitEvent: false })
      control.setValue(false, { emitEvent: false});
    });
  }
}

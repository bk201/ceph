import { Component, OnInit, DefaultIterableDiffer } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';
import { ActionLabelsI18n } from '../../../../shared/constants/app.constants';
import { CdFormGroup } from '../../../../shared/forms/cd-form-group';
import { FormControl } from '@angular/forms';
import { OsdFeature } from './osd-feature.interface';
import * as _ from 'lodash';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { OrchestratorService } from '../../../../shared/api/orchestrator.service';
import { InventoryNode, Device } from '../../inventory/inventory.model';
import { Icons } from '../../../../shared/enum/icons.enum';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { OsdDevicesSelectionModalComponent } from '../osd-devices-selection-modal/osd-devices-selection-modal.component';


@Component({
  selector: 'cd-osd-form',
  templateUrl: './osd-form.component.html',
  styleUrls: ['./osd-form.component.scss']
})
export class OsdFormComponent implements OnInit {
  debug = true;

  icons = Icons;

  osdForm: CdFormGroup;
  columns: Array<CdTableColumn> = [];

  loading = false;
  allDevices: Device[] = [];
  freeDevices: Device[] = [];
  dataDevices: Device[] = [];
  dbDevices: Device[] = [];
  walDevices: Device[] = [];
  dataDeviceFilters = [];
  dbDeviceFilters = [];
  walDeviceFilters = [];
  hostname = '';
  driveGroupSpec = {};

  deviceTypes = {
    'data': {
      devices: [],
    },
    'wal': {

    },
    'db': {

    }
  }

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
        walSlots: new FormControl(0, { updateOn: 'blur' }),
        dbSlots: new FormControl(0, { updateOn: 'blur' }),
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

  updateDriveGroup() {
  }

  showDevicesSelectionModal(type: string) {
    const options: ModalOptions = {
      class: 'modal-xl',
      initialState: {
        hostname: this.hostname,
        deviceType: type,
        devices: this.freeDevices
      }
    }
    const modalRef = this.bsModalService.show(OsdDevicesSelectionModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      // this. = result.filterInDevices;
      this.freeDevices = result.filterOutDevices;


    });
  }

  showDataDevicesModal() {
    const options: ModalOptions = {
      class: 'modal-xl',
      initialState: {
        deviceType: 'data',
        devices: this.freeDevices
      }
    }
    const modalRef = this.bsModalService.show(OsdDevicesSelectionModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.dataDevices = result.filterInDevices;
      this.freeDevices = result.filterOutDevices;
      this.dbDevices = [];
      this.walDevices = [];
      this.hostname = '';
      const hostnameFilter = _.find(result.filters, {'prop': 'hostname'})
      if (hostnameFilter) {
        this.hostname = hostnameFilter.value;
        this.freeDevices = this.freeDevices.filter((device: Device) => {return device.hostname === this.hostname});
      }
      this.dataDeviceFilters = result.filters;
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
    const modalRef = this.bsModalService.show(OsdDevicesSelectionModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.dbDevices = result.filterInDevices;
      this.freeDevices = result.filterOutDevices;
      this.dbDeviceFilters = result.filters;
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
    const modalRef = this.bsModalService.show(OsdDevicesSelectionModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.walDevices = result.filterInDevices;
      this.freeDevices = result.filterOutDevices;
      this.walDeviceFilters = result.filters;
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

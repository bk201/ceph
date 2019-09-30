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

  icons = Icons;

  osdForm: CdFormGroup;
  columns: Array<CdTableColumn> = [];

  loading = false;
  data = new OsdFormData(this.i18n);
  allDevices: Device[] = [];
  dataDevices: Device[] = [];
  freeDevices: Device[] = [];
  dbDevices: Device[] = [];
  walDevices: Device[] = [];
  filters = [];
  hostname = '';
  
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
        desc: 'Encrypted'
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

    this.initFilters();
  }

  createForm() {
    this.osdForm = new CdFormGroup(
      {

        enableDbDevices: new FormControl(false),
        dbSlots: new FormControl(0, { updateOn: 'blur' }),
        walSlots: new FormControl(0, { updateOn: 'blur' }),
        features: new CdFormGroup(
          this.featureList.reduce((acc, e) => {
            acc[e.key] = new FormControl({ value: false, disabled: !! e.initDisabled });
            return acc;
          }, {})
        )
      }
    )
  }

  private initFilters() {
    this.filters = [
      {
        label: this.i18n('Hostname'),
        prop: 'hostname',
        initValue: '*',
        value: '*',
        options: ['*'],
        applyFilter: (row, value) => {
          if (value === '*') {
            return true;
          }
          return row.hostname === value;
        }
      },
      {
        label: this.i18n('Type'),
        prop: 'type',
        initValue: '*',
        value: '*',
        options: ['*'],
        applyFilter: (row, value) => {
          if (value === '*') {
            return true;
          }
          return row.type === value;
        }
      },
      {
        label: this.i18n('Vendor'),
        prop: 'vendor',
        initValue: '*',
        value: '*',
        options: ['*'],
        applyFilter: (row, value) => {
          if (value === '*') {
            return true;
          }
          return row.vendor === value;
        }
      },
      {
        label: this.i18n('Model'),
        prop: 'model',
        initValue: '*',
        value: '*',
        options: ['*'],
        applyFilter: (row, value) => {
          if (value === '*') {
            return true;
          }
          return row.model === value;
        }
      }
    ];
  }

  updateFilterOptions(devices: Device[]) {
    this.initFilters();
    this.filters.forEach((filter)=> {
      let options = _.sortedUniq(_.map(devices, filter.prop).sort());
      filter.options = filter.options.concat(options);
    });
  }

  getDataDevices(context: CdTableFetchDataContext) {
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
        this.updateFilterOptions(devices);
        this.allDevices = devices;
        this.dataDevices = [...devices];
        this.updateSharedDevices();
        this.loading = false;
      },
      () => {
        this.allDevices = [];
        this.dataDevices = [];
        this.updateSharedDevices();
        this.loading = false;
        context.error();
      }
    );
  }

  dbDeviceSelection() {}

  walDeviceSelection() {}

  submit() {}

  onFilterChange () {
    let devices: any = [...this.allDevices];
    this.freeDevices = [];

    this.filters.forEach((filter) => {
      if (filter.value === filter.initValue) {
        return;
      }
      if (filter.prop === 'hostname') {
        this.hostname = filter.value;
      }
      let obj = {[filter.prop]: filter.value};
      let tmp = _.partition(devices, obj);
      devices = tmp[0];
      this.freeDevices = this.freeDevices.concat(tmp[1])
    });

    this.dataDevices = devices;
    this.updateSharedDevices();
  }

  resetFilter() {
    this.filters.forEach((item) => {
      item.value = item.initValue;
    });
    this.hostname = '';
    this.dataDevices = [...this.allDevices];
    this.updateSharedDevices();
  }

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

  showDbDevicesModal() {
    const options: ModalOptions = {
      class: 'modal-lg',
      initialState: {
        devices: this.freeDevices
      }
    }
    const modalRef = this.bsModalService.show(OsdSharedDevicesModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      console.log(result);
      this.dbDevices = result.filteredDevices;
    });
  }

  clearDbDevices() {
    this.dbDevices = [];
  }
}

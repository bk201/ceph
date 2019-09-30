import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionLabelsI18n } from '../../../../shared/constants/app.constants';
import { CdFormGroup } from '../../../../shared/forms/cd-form-group';
import { CdFormBuilder } from '../../../../shared/forms/cd-form-builder';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { DimlessBinaryPipe } from '../../../../shared/pipes/dimless-binary.pipe';
import { Device } from '../../inventory/inventory.model';
import * as _ from 'lodash';
import { Icons } from '../../../../shared/enum/icons.enum';


@Component({
  selector: 'cd-osd-shared-devices-modal',
  templateUrl: './osd-shared-devices-modal.component.html',
  styleUrls: ['./osd-shared-devices-modal.component.scss']
})
export class OsdSharedDevicesModalComponent implements OnInit {
  @Output()
  submitAction = new EventEmitter()

  icons = Icons;

  shareDeviceType = 'DB';
  formGroup: CdFormGroup;
  action: string;

  columns: Array<CdTableColumn> = [];
  filters = [];
  devices: Device[] = [];
  isFiltered = false;
  filteredDevices: Device[] = [];
  freeDevices: Device[] = [];


  constructor(
    private formBuilder: CdFormBuilder,
    private dimlessBinary: DimlessBinaryPipe,
    private i18n: I18n,
    public bsModalRef: BsModalRef,
    public actionLabels: ActionLabelsI18n
  ) { 
    this.action = actionLabels.ADD;
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
    });
  }

  ngOnInit() {
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

    this.filteredDevices = [...this.devices];
    this.initFilters();
    this.updateFilterOptions(this.filteredDevices);
  }

  private initFilters() {
    this.filters = [
      {
        label: this.i18n('Hostname'),
        prop: 'hostname',
        initValue: '*',
        value: '*',
        options: ['*']
      },
      {
        label: this.i18n('Type'),
        prop: 'type',
        initValue: '*',
        value: '*',
        options: ['*']
      },
      {
        label: this.i18n('Vendor'),
        prop: 'vendor',
        initValue: '*',
        value: '*',
        options: ['*']
      },
      {
        label: this.i18n('Model'),
        prop: 'model',
        initValue: '*',
        value: '*',
        options: ['*']
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

  resetFilter() {
    this.filters.forEach((item) => {
      item.value = item.initValue;
    });
    this.filteredDevices = [...this.devices];
  }

  onFilterChange () {
    let devices: any = [...this.devices];
    this.isFiltered = false;

    this.filters.forEach((filter) => {
      if (filter.value === filter.initValue) {
        return;
      }
      this.isFiltered = true;
      let obj = {[filter.prop]: filter.value};
      let tmp = _.partition(devices, obj);
      devices = tmp[0];
      this.freeDevices = this.freeDevices.concat(tmp[1])
    });

    // console.log(this.freeDevices);
    this.filteredDevices = devices;
  }

  onSubmit() {
    const result = {
      filteredDevices: this.filteredDevices,
      freeDeviecs: this.freeDevices
    }
    this.submitAction.emit(result);
    this.bsModalRef.hide();
  }
}

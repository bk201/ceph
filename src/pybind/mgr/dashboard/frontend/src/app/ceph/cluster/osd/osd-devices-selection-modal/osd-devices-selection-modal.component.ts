import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActionLabelsI18n } from '../../../../shared/constants/app.constants';
import { CdFormGroup } from '../../../../shared/forms/cd-form-group';
import { CdFormBuilder } from '../../../../shared/forms/cd-form-builder';
import * as _ from 'lodash';
import { Icons } from '../../../../shared/enum/icons.enum';
import { InventoryDevice } from '../../inventory/inventory-devices/inventory-devices.model';


@Component({
  selector: 'cd-osd-devices-selection-modal',
  templateUrl: './osd-devices-selection-modal.component.html',
  styleUrls: ['./osd-devices-selection-modal.component.scss']
})
export class OsdDevicesSelectionModalComponent implements OnInit {
  @Output()
  submitAction = new EventEmitter();

  icons = Icons;
  filterColumns: string[];

  hostname: string;
  deviceType: string;
  formGroup: CdFormGroup;
  action: string;

  devices: InventoryDevice[] = [];
  canSubmit = false;
  filters = [];
  filterInDevices: InventoryDevice[] = [];
  filterOutDevices: InventoryDevice[] = [];

  isFiltered = false;

  constructor(
    private formBuilder: CdFormBuilder,
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
  }

  onFilterChange(event) {
    this.canSubmit = false;
    this.filters = event.filters;
    if (_.isEmpty(event.filters)) {
      // filters are cleared
      this.filterInDevices = [];
      this.filterOutDevices = [];
    } else {
      // at least one filter is required (except hostname)
      const filters = this.filters.filter((filter) => {
        return filter.prop !== 'hostname';
      });
      this.canSubmit = !_.isEmpty(filters);

      this.filterInDevices = event.filterInDevices;
      this.filterOutDevices = event.filterOutDevices;
    }
  }

  onSubmit() {
    this.submitAction.emit({
      filters: this.filters,
      filterInDevices: this.filterInDevices,
      filterOutDevices: this.filterOutDevices,
    });
    this.bsModalRef.hide();
  }
}

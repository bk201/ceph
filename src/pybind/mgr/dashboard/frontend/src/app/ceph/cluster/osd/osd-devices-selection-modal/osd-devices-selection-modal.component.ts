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
  selector: 'cd-osd-devices-selection-modal',
  templateUrl: './osd-devices-selection-modal.component.html',
  styleUrls: ['./osd-devices-selection-modal.component.scss']
})
export class OsdDevicesSelectionModalComponent implements OnInit {
  @Output()
  submitAction = new EventEmitter();

  icons = Icons;
  filterColumns = ['hostname', 'rotates', 'vendor', 'model'];

  hostname: string;
  deviceType: string;
  formGroup: CdFormGroup;
  action: string;

  columns: Array<CdTableColumn> = [];
  devices: Device[] = [];
  filters = {};
  filterInDevices: Device[] = [];
  filterOutDevices: Device[] = [];

  isFiltered = false;

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
  }

  onFilterChange(event) {
    console.log(`filter change: ${event}`);
    console.log(event);

    this.filters = event.filters;
    if (_.isEmpty(event.filters)) {
      // filters are cleared
      this.filterInDevices = [];
      this.filterOutDevices = [];
    } else {
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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Icons } from '../../../../shared/enum/icons.enum';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { OsdDevicesSelectionModalComponent } from '../osd-devices-selection-modal/osd-devices-selection-modal.component';
import * as _ from 'lodash';
import { InventoryDevice } from '../../inventory/inventory-devices/inventory-devices.model';

@Component({
  selector: 'cd-osd-device-selection-groups',
  templateUrl: './osd-device-selection-groups.component.html',
  styleUrls: ['./osd-device-selection-groups.component.scss']
})
export class OsdDeviceSelectionGroupsComponent implements OnInit {

  // data, wal, db
  @Input() type: string;

  // Data, WAL, DB
  @Input() name: string;

  @Input() hostname: string;

  @Input() availDevices: InventoryDevice[] = [];

  @Input() canSelect: boolean;

  @Output()
  selected = new EventEmitter();

  @Output()
  cleared = new EventEmitter();

  icons = Icons;
  devices: InventoryDevice[] = [];
  appliedFilters = [];

  constructor(private bsModalService: BsModalService) {}

  ngOnInit() {
  }

  showSelectionModal() {
    let filterColumns = ['rotates', 'vendor', 'model', 'size'];
    if (this.type === 'data') {
      filterColumns = ['hostname', ...filterColumns];
    }
    const options: ModalOptions = {
      class: 'modal-xl',
      initialState: {
        hostname: this.hostname,
        deviceType: this.name,
        devices: this.availDevices,
        filterColumns: filterColumns
      }
    }
    const modalRef = this.bsModalService.show(OsdDevicesSelectionModalComponent, options);
    modalRef.content.submitAction.subscribe((result: any) => {
      this.devices = result.filterInDevices;
      this.appliedFilters = result.filters;

      result['type'] = this.type;
      this.selected.emit(result);
    });

  }

  clearDevices() {
    const result = {
      type: this.type,
      clearedDevices: [...this.devices]
    }
    this.devices = [];
    this.cleared.emit(result);
  }
}

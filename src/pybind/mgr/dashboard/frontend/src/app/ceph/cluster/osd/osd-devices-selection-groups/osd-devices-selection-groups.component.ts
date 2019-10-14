import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Icons } from '../../../../shared/enum/icons.enum';
import { InventoryDevice } from '../../inventory/inventory-devices/inventory-devices.model';
import { OsdDevicesSelectionModalComponent } from '../osd-devices-selection-modal/osd-devices-selection-modal.component';

@Component({
  selector: 'cd-osd-devices-selection-groups',
  templateUrl: './osd-devices-selection-groups.component.html',
  styleUrls: ['./osd-devices-selection-groups.component.scss']
})
export class OsdDevicesSelectionGroupsComponent implements OnInit {
  // data, wal, db
  @Input() type: string;

  // Data, WAL, DB
  @Input() name: string;

  @Input() hostname: string;

  @Input() availDevices: InventoryDevice[];

  @Input() canSelect: boolean;

  @Output()
  selected = new EventEmitter();

  @Output()
  cleared = new EventEmitter();

  icons = Icons;
  devices: InventoryDevice[] = [];
  appliedFilters = [];

  constructor(private bsModalService: BsModalService) {}

  ngOnInit() {}

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
    };
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
    };
    this.devices = [];
    this.cleared.emit(result);
  }
}

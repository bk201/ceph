import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { getterForProp } from '@swimlane/ngx-datatable/release/utils';
import * as _ from 'lodash';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

import { OrchestratorService } from '../../../../shared/api/orchestrator.service';
import { FormModalComponent } from '../../../../shared/components/form-modal/form-modal.component';
import { TableComponent } from '../../../../shared/datatable/table/table.component';
import { CellTemplate } from '../../../../shared/enum/cell-template.enum';
import { Icons } from '../../../../shared/enum/icons.enum';
import { NotificationType } from '../../../../shared/enum/notification-type.enum';
import { CdTableAction } from '../../../../shared/models/cd-table-action';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { CdTableSelection } from '../../../../shared/models/cd-table-selection';
import { Permission } from '../../../../shared/models/permissions';
import { DimlessBinaryPipe } from '../../../../shared/pipes/dimless-binary.pipe';
import { AuthStorageService } from '../../../../shared/services/auth-storage.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { InventoryDeviceFilter } from './inventory-device-filter.interface';
import { InventoryDeviceFiltersChangeEvent } from './inventory-device-filters-change-event.interface';
import { InventoryDevice } from './inventory-device.model';
import { ColumnFilter } from './column-filter.interface';

@Component({
  selector: 'cd-inventory-devices',
  templateUrl: './inventory-devices.component.html',
  styleUrls: ['./inventory-devices.component.scss']
})
export class InventoryDevicesComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(TableComponent, { static: true })
  table: TableComponent;

  // Devices
  @Input() devices: InventoryDevice[] = [];

  // Do not display these columns
  @Input() hiddenColumns: string[] = [];

  // Show filters for these columns, specify empty array to disable
  @Input() filterColumns = [
    'hostname',
    'human_readable_type',
    'available',
    'sys_api.vendor',
    'sys_api.model',
    'sys_api.size'
  ];

  // Device table row selection type
  @Input() selectionType: string = undefined;

  @Output() filterChange = new EventEmitter<InventoryDeviceFiltersChangeEvent>();

  @Output() fetchInventory = new EventEmitter();

  filterInDevices: InventoryDevice[] = [];
  filterOutDevices: InventoryDevice[] = [];

  icons = Icons;
  columns: Array<CdTableColumn> = [];

  filters: ColumnFilter[] = [];

  get filtered(): boolean {
    return _.some(this.filters, (filter)=> {
      return filter.applied !== undefined;
    })
  }

  selectedFilter: any;
  selection: CdTableSelection = new CdTableSelection();
  permission: Permission;
  tableActions: CdTableAction[];
  fetchInventorySub: Subscription;

  constructor(
    private authStorageService: AuthStorageService,
    private dimlessBinary: DimlessBinaryPipe,
    private i18n: I18n,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private orchService: OrchestratorService
  ) {}

  ngOnInit() {
    this.permission = this.authStorageService.getPermissions().osd;
    this.tableActions = [
      {
        permission: 'update',
        icon: Icons.show,
        click: () => this.identifyDevice(),
        name: this.i18n('Identify'),
        disable: () => !this.selection.hasSingleSelection,
        canBePrimary: (selection: CdTableSelection) => !selection.hasSingleSelection,
        visible: () => _.isString(this.selectionType)
      }
    ];
    const columns = [
      {
        name: this.i18n('Hostname'),
        prop: 'hostname',
        flexGrow: 1
      },
      {
        name: this.i18n('Device path'),
        prop: 'path',
        flexGrow: 1
      },
      {
        name: this.i18n('Type'),
        prop: 'human_readable_type',
        flexGrow: 1,
        cellTransformation: CellTemplate.badge,
        customTemplateConfig: {
          map: {
            hdd: { value: 'HDD', class: 'badge-hdd' },
            'ssd/nvme': { value: 'SSD', class: 'badge-ssd' }
          }
        }
      },
      {
        name: this.i18n('Available'),
        prop: 'available',
        flexGrow: 1
      },
      {
        name: this.i18n('Vendor'),
        prop: 'sys_api.vendor',
        flexGrow: 1
      },
      {
        name: this.i18n('Model'),
        prop: 'sys_api.model',
        flexGrow: 1
      },
      {
        name: this.i18n('Size'),
        prop: 'sys_api.size',
        flexGrow: 1,
        pipe: this.dimlessBinary
      },
      {
        name: this.i18n('OSDs'),
        prop: 'osd_ids',
        flexGrow: 1,
        cellTransformation: CellTemplate.badge,
        customTemplateConfig: {
          class: 'badge-dark',
          prefix: 'osd.'
        }
      }
    ];

    this.columns = columns.filter((col: any) => {
      return !this.hiddenColumns.includes(col.prop);
    });

    this.filters = this.columns
      .filter((col: any) => {
        return this.filterColumns.includes(col.prop);
      })
      .map((col: any) => {
        return {
          label: col.name,
          prop: col.prop,
          values: [],
          pipe: col.pipe
        };
      });

    this.filterInDevices = [...this.devices];
    this.updateFilterValues(this.devices);
    if (this.fetchInventory.observers.length > 0) {
      this.fetchInventorySub = this.table.fetchData.subscribe(() => {
        this.fetchInventory.emit();
      });
    }

    this.selectedFilter = _.first(this.filters);
  }

  ngOnDestroy() {
    if (this.fetchInventorySub) {
      this.fetchInventorySub.unsubscribe();
    }
  }

  ngOnChanges() {
    this.updateFilterValues(this.devices);
    this.filterInDevices = [...this.devices];
    this.doFilter();
  }

  refresh() {
    if (this.fetchInventory.observers.length > 0) {
      this.fetchInventory.emit();
    }
  }

  updateFilterValues(devices: InventoryDevice[]) {
    // update all possible values in a column
    this.filters.forEach((filter) => {
      // remove ""?
      const values = _.sortedUniq(_.map(devices, filter.prop).sort());
      const options =  values.map((v) => {
        return {
          raw: _.toString(v),
          formatted: filter.pipe ? filter.pipe.transform(v) : v
        };
      });

      // In case a previous value is not available anymore
      if (
        filter.applied &&
        !_.isUndefined(_.find(options, { value: _.toString(filter.applied.raw)}))
      ) {
        filter.applied = undefined;
      }

      filter.values = options;
    });
  }

  doFilter() {
    this.filterOutDevices = [];
    const appliedFilters = [];
    let devices: any = [...this.devices];
    this.filters.forEach((filter) => {
      if (filter.applied === undefined) {
        return;
      }
      appliedFilters.push({
        label: filter.label,
        prop: filter.prop,
        value: filter.applied.raw,
        formatValue: filter.applied.formatted
      });
      // Separate devices to filter-in and filter-out parts.
      // Cast column value to string type because values are always in string.
      const parts = _.partition(devices, (row) => {
        // use getter from ngx-datatable for props like 'sys_api.size'
        const valueGetter = getterForProp(filter.prop);
        return `${valueGetter(row, filter.prop)}` === filter.applied.raw;
      });
      devices = parts[0];
      this.filterOutDevices = [...this.filterOutDevices, ...parts[1]];
    });
    this.filterInDevices = devices;
    this.filterChange.emit({
      filters: appliedFilters,
      filterInDevices: this.filterInDevices,
      filterOutDevices: this.filterOutDevices
    });
  }

  onFilterChange() {
    this.doFilter();
  }

  onClearFilters() {
    this.filters.forEach((filter) => {
      filter.applied = undefined;
    });
    this.filterInDevices = [...this.devices];
    this.filterOutDevices = [];
    this.filterChange.emit({
      filters: [],
      filterInDevices: this.filterInDevices,
      filterOutDevices: this.filterOutDevices
    });

    this.selectedFilter = _.first(this.filters);
  }

  selectFilter(filter) {
    this.selectedFilter = filter;
  }

  selectFilterValue(value) {
    // deep copy?
    this.selectedFilter.applied = value;
    this.doFilter();
  }

  deleteFilter(filter: ColumnFilter) {
    filter.applied = undefined; 
    this.doFilter();
  }

  updateSelection(selection: CdTableSelection) {
    this.selection = selection;
  }

  identifyDevice() {
    const selected = this.selection.first();
    const hostname = selected.hostname;
    const device = selected.path || selected.device_id;
    this.modalService.show(FormModalComponent, {
      initialState: {
        titleText: this.i18n(`Identify device {{device}}`, { device }),
        message: this.i18n('Please enter the duration how long to blink the LED.'),
        fields: [
          {
            type: 'select',
            name: 'duration',
            value: 300,
            required: true,
            options: [
              { text: this.i18n('1 minute'), value: 60 },
              { text: this.i18n('2 minutes'), value: 120 },
              { text: this.i18n('5 minutes'), value: 300 },
              { text: this.i18n('10 minutes'), value: 600 },
              { text: this.i18n('15 minutes'), value: 900 }
            ]
          }
        ],
        submitButtonText: this.i18n('Execute'),
        onSubmit: (values) => {
          this.orchService.identifyDevice(hostname, device, values.duration).subscribe(() => {
            this.notificationService.show(
              NotificationType.success,
              this.i18n(`Identifying '{{device}}' started on host '{{hostname}}'`, {
                hostname,
                device
              })
            );
          });
        }
      }
    });
  }
}

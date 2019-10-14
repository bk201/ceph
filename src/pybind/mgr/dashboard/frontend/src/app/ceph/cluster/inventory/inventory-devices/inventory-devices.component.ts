import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Device } from '../inventory.model';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { DimlessBinaryPipe } from '../../../../shared/pipes/dimless-binary.pipe';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { Icons } from '../../../../shared/enum/icons.enum';
import * as _ from 'lodash';


@Component({
  selector: 'cd-inventory-devices',
  templateUrl: './inventory-devices.component.html',
  styleUrls: ['./inventory-devices.component.scss']
})
export class InventoryDevicesComponent implements OnInit, OnChanges {
  // Devices
  @Input() devices: Device[] = [];

  // Do not display these columns
  @Input() hiddenColumns: string[] = [];

  // Show filter select menu for these columns, specify empty array to disable
  // filters
  @Input() filterColumns = ['hostname', 'type', 'rotates', 'available', 'vendor', 'model'];

  // This is merely used to tell users that some filters are already applied on initial data.
  // These filters has no effect at all.
  // Each item -> { label: 'i18n label of filter', value: 'value' }
  @Input() preFilters = [];

  @Output() filterChange = new EventEmitter();

  filterInDevices: Device[] = [];
  filterOutDevices: Device[] = [];

  icons = Icons;
  columns: Array<CdTableColumn> = [];
  filters = [];


  constructor(
    private dimlessBinary: DimlessBinaryPipe,
    private i18n: I18n
  ) { }

  ngOnInit() {
    const columns = [
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
        name: this.i18n('Available'),
        prop: 'available',
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
      {
        name: this.i18n('OSD ID'),
        prop: 'osd_id',
        flexGrow: 1
      }
    ];

    this.columns = columns.filter((col: any) => {
      return !this.hiddenColumns.includes(col.prop)
    });

    // init filters
    this.filters = this.columns.filter((col: any) => {
      return this.filterColumns.includes(col.prop)
    }).map((col: any) => {
      return {
        label: col.name,
        prop: col.prop,
        initValue: '*',
        value: '*',
        options: ['*']
      }
    });

    this.filterInDevices = [...this.devices];
    this.updateFilterOptions(this.devices);
  }

  ngOnChanges() {
    this.updateFilterOptions(this.devices);
    this.filterInDevices = [...this.devices];
    // TODO: apply filter, columns changes, filter changes
  }

  updateFilterOptions(devices: Device[]) {
    // update filter options to all possible values in a column, might be time-consuming
    this.filters.forEach((filter) => {
      let options = _.sortedUniq(_.map(devices, filter.prop).sort());
      filter.options = ['*'].concat(options);
    })
  }

  doFilter() {
    this.filterOutDevices = [];
    let appliedFilters = [];
    let devices: any = [...this.devices];
    this.filters.forEach((filter) => {
      if (filter.value === filter.initValue) {
        return;
      }
      appliedFilters = appliedFilters.concat({ 
        label: filter.label,
        prop: filter.prop,
        value: filter.value
      });
      // Separate devices to filter-in and filter-out parts.
      // Cast column value to string type because options are always string.
      let parts = _.partition(devices, (row)=> {
        return `${row[filter.prop]}` === filter.value;
      })
      devices = parts[0];
      this.filterOutDevices = this.filterOutDevices.concat(parts[1])
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

  onFilterReset() {
    this.filters.forEach((item) => {
      item.value = item.initValue;
    });
    this.filterInDevices = [...this.devices];
    this.filterOutDevices = [];
    this.filterChange.emit({
      filters: [],
      filterInDevices: this.filterInDevices,
      filterOutDevices: this.filterOutDevices
    });
  }
}

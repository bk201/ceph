import { PipeTransform } from '@angular/core';
import { InventoryDevice } from './inventory-devices.model';

export interface InventoryDeviceFilter {
  label: string;
  prop: string;
  initValue: string;
  value: string;
  options: {
    value: string;
    formatValue: string;
  }[];
  pipe?: PipeTransform;
}

export interface InventoryDeviceAppliedFilters {
  label: string;
  prop: string;
  value: string;
  formatValue: string;
}

export interface InventoryDeviceFiltersChangeEvent {
  filters: InventoryDeviceAppliedFilters[];
  filterInDevices: InventoryDevice[];
  filterOutDevices: InventoryDevice[];
}

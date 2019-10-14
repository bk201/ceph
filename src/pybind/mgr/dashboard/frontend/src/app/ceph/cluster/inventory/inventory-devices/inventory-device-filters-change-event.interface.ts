import { InventoryDevice } from './inventory-device.model';
import { InventoryDeviceAppliedFilter } from './inventory-device-applied-filters.interface';

export interface InventoryDeviceFiltersChangeEvent {
  filters: InventoryDeviceAppliedFilter[];
  filterInDevices: InventoryDevice[];
  filterOutDevices: InventoryDevice[];
}

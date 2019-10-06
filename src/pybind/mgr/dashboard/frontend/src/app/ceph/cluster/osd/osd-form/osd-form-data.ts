import * as _ from 'lodash';
import { InventoryDeviceAppliedFilters } from '../../inventory/inventory-devices/inventory-devices.interface';


export class DriveGroup {
  spec = {};

  static filterDGMap = {
    vendor: 'vendor',
    model: 'id_model',
    rotates: 'rotates',
    size: 'size'
  }

  reset() {
    this.spec = {};
  }

  setHostPattern(pattern: string) {
    this.spec['host_pattern'] = pattern;
  }

  clearHostPattern(pattern: string) {
    delete this.spec['host_pattern'];
  }

  setDeviceSelection(type: string, appliedFilters: InventoryDeviceAppliedFilters[]) {
    const key = `${type}_devices`;
    this.spec[key] = {};
    appliedFilters.forEach((filter) => {
      const attr = DriveGroup.filterDGMap[filter.prop];
      if (attr) {
        this.spec[key][attr] = filter.value;
      }
    });
  }

  clearDeviceSelection(type: string) {
    const key = `${type}_devices`;
    delete this.spec[key];
  }

  setSlots(type: string, slots: number) {
    const key = `${type}_slots`;
    if (slots === 0){ 
      delete this.spec[key];
    } else {
      this.spec[key] = slots;
    }
  }

  setFeature(feature: string, enabled: boolean) {
    if (enabled) {
      this.spec[feature] = true;
    } else {
      delete this.spec[feature];
    }
  }
}

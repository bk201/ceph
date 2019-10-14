import * as _ from 'lodash';
import { InventoryDeviceAppliedFilters } from '../../inventory/inventory-devices/inventory-devices.interface';
import { FormatterService } from '../../../../shared/services/formatter.service';
import { DimlessBinaryPipe } from '../../../../shared/pipes/dimless-binary.pipe';
import { format } from 'path';


export class DriveGroup {
  // DriveGroupSpec object.
  spec = {};

  // Map from filter column prop to device selection attribute name
  private deviceSelectionAttrs: {
    [key: string]: {
      attr: string,
      formatter?: Function
    }
  };

  private formatterService: FormatterService;

  constructor() {
    this.formatterService = new FormatterService();
    this.deviceSelectionAttrs = {
      vendor: {
        attr: 'vendor'
      },
      model: {
        attr: 'id_model'
      },
      rotates: {
        attr: 'rotates',
        formatter: (value: string) => {
          return JSON.parse(value);
        }
      },
      size: {
        attr: 'size',
        formatter: (value: string) => {
          return this.formatterService.format_number(value, 1024, [
            'B',
            'KB',
            'MB',
            'GB',
            'TB',
            'PB'
          ]).replace(' ', '');
        }
      }
    }
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
      const attr = this.deviceSelectionAttrs[filter.prop].attr;
      const formatter = this.deviceSelectionAttrs[filter.prop].formatter;
      if (attr) {
        this.spec[key][attr] = formatter ? formatter(filter.value) : filter.value;
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

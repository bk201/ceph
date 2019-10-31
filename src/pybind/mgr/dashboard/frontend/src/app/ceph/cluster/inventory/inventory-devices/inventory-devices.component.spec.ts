import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import * as _ from 'lodash';

import {
  configureTestBed,
  FixtureHelper,
  i18nProviders
} from '../../../../../testing/unit-test-helper';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryDevice } from './inventory-device.model';
import { InventoryDevicesComponent } from './inventory-devices.component';

describe('InventoryDevicesComponent', () => {
  let component: InventoryDevicesComponent;
  let fixture: ComponentFixture<InventoryDevicesComponent>;
  let fixtureHelper: FixtureHelper;
  let devices: InventoryDevice[];
  const data = [
    ['node0', '1', false, 'SSD', 'sda', 1024, false, false, undefined, '', 'AAA', 'aaa'],
    ['node0', '2', false, 'SSD', 'sdb', 1024, false, true, undefined, '', 'AAA', 'aaa'],
    ['node0', '3', false, 'HDD', 'sdc', 2048, false, true, undefined, '', 'BBB', 'bbb'],
    ['node1', '4', false, 'HDD', 'sda', 1024, false, false, undefined, '', 'CCC', 'ccc']
  ];
  const initDevices = () => {
    devices = data.map((datum: object) => {
      return {
        hostname: datum[0],
        uid: datum[1],
        blank: datum[2],
        type: datum[3],
        id: datum[4],
        size: datum[5],
        rotates: datum[6],
        available: datum[7],
        dev_id: datum[8],
        extended: datum[9],
        vendor: datum[10],
        model: datum[11]
      };
    });
    component.devices = devices;
  };

  configureTestBed({
    imports: [FormsModule, SharedModule],
    providers: [i18nProviders],
    declarations: [InventoryDevicesComponent]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryDevicesComponent);
    fixtureHelper = new FixtureHelper(fixture);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('without device data', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have columns that are sortable', () => {
      expect(component.columns.every((column) => Boolean(column.prop))).toBeTruthy();
    });

    it('should have filters', () => {
      const labelTexts = fixtureHelper.getTextAll('.tc_filter span:first-child');
      const filterLabels = _.map(component.filters, 'label');
      expect(labelTexts).toEqual(filterLabels);

      const optionTexts = fixtureHelper.getTextAll('.tc_filter option');
      expect(optionTexts).toEqual(_.map(component.filters, 'initValue'));
    });
  });

  describe('with device data', () => {
    beforeEach(() => {
      initDevices();
      fixture.detectChanges();
    });

    it('should have filters', () => {
      for (let i = 0; i < component.filters.length; i++) {
        const optionTexts = fixtureHelper.getTextAll(`.tc_filter:nth-child(${i + 1}) option`);
        const optionTextsSet = new Set(optionTexts);

        const filter = component.filters[i];
        const columnValues = devices.map((device: InventoryDevice) => {
          const value = device[filter.prop];
          const formatValue = filter.pipe ? filter.pipe.transform(value) : value;
          return `${formatValue}`;
        });
        const expectedOptionsSet = new Set(['*', ...columnValues]);
        expect(optionTextsSet).toEqual(expectedOptionsSet);
      }
    });

    it('should filter a single column', () => {
      spyOn(component.filterChange, 'emit');
      fixtureHelper.selectElement('.tc_filter:nth-child(1) select', 'node1');
      expect(component.filterInDevices.length).toBe(1);
      expect(component.filterInDevices[0]).toEqual(devices[3]);
      expect(component.filterChange.emit).toHaveBeenCalled();
    });

    it('should filter multiple columns', () => {
      spyOn(component.filterChange, 'emit');
      fixtureHelper.selectElement('.tc_filter:nth-child(2) select', 'HDD');
      fixtureHelper.selectElement('.tc_filter:nth-child(1) select', 'node0');
      expect(component.filterInDevices.length).toBe(1);
      expect(component.filterInDevices[0].uid).toBe('3');
      expect(component.filterChange.emit).toHaveBeenCalledTimes(2);
    });
  });
});

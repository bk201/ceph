import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import {
  configureTestBed,
  FixtureHelper,
  i18nProviders
} from '../../../../../testing/unit-test-helper';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryDevicesComponent } from '../../inventory/inventory-devices/inventory-devices.component';
import { OsdDevicesSelectionGroupsComponent } from './osd-devices-selection-groups.component';

describe('OsdDevicesSelectionGroupsComponent', () => {
  let component: OsdDevicesSelectionGroupsComponent;
  let fixture: ComponentFixture<OsdDevicesSelectionGroupsComponent>;
  let fixtureHelper: FixtureHelper;
  const devices = [
    {
      hostname: 'node0',
      uid: '1',
      blank: false,
      type: 'SSD',
      id: '/dev/sda',
      size: 1024,
      rotates: false,
      available: true,
      dev_id: '',
      extended: undefined,
      vendor: 'AAA',
      model: 'aaa'
    }
  ];

  const buttonSelector = '.col-sm-9 button';
  const getButton = () => {
    const debugElement = fixtureHelper.getElementByCss(buttonSelector);
    return debugElement.nativeElement;
  };

  configureTestBed({
    imports: [FormsModule, SharedModule],
    providers: [i18nProviders],
    declarations: [OsdDevicesSelectionGroupsComponent, InventoryDevicesComponent]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdDevicesSelectionGroupsComponent);
    fixtureHelper = new FixtureHelper(fixture);
    component = fixture.componentInstance;
    component.canSelect = true;
  });

  describe('without available devices', () => {
    beforeEach(() => {
      component.availDevices = [];
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display Add button in disabled state', () => {
      const button = getButton();
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(true);
      expect(button.textContent).toBe('Add');
    });

    it('should not display devices table', () => {
      fixtureHelper.expectElementVisible('cd-inventory-devices', false);
    });
  });

  describe('without devices selected', () => {
    beforeEach(() => {
      component.availDevices = devices;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display Add button in enabled state', () => {
      const button = getButton();
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe('Add');
    });

    it('should not display devices table', () => {
      fixtureHelper.expectElementVisible('cd-inventory-devices', false);
    });
  });

  describe('with devices selected', () => {
    beforeEach(() => {
      component.availDevices = [];
      component.devices = devices;
      fixture.detectChanges();
    });

    it('should display Clear button', () => {
      const button = getButton();
      expect(button).toBeTruthy();
      expect(button.disabled).toBe(false);
      expect(button.textContent).toBe('Clear');
    });

    it('should display devices table', () => {
      fixtureHelper.expectElementVisible('cd-inventory-devices', true);
    });

    it('should clear devices by clicking Clear button', () => {
      spyOn(component.cleared, 'emit');
      fixtureHelper.clickElement(buttonSelector);
      fixtureHelper.expectElementVisible('cd-inventory-devices', false);
      const event = {
        type: undefined,
        clearedDevices: devices
      };
      expect(component.cleared.emit).toHaveBeenCalledWith(event);
    });
  });
});

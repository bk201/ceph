import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryDevicesComponent } from '../../inventory/inventory-devices/inventory-devices.component';
import { OsdDeviceSelectionGroupsComponent } from './osd-device-selection-groups.component';

describe('OsdDeviceSelectionGroupsComponent', () => {
  let component: OsdDeviceSelectionGroupsComponent;
  let fixture: ComponentFixture<OsdDeviceSelectionGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SharedModule],
      declarations: [OsdDeviceSelectionGroupsComponent, InventoryDevicesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdDeviceSelectionGroupsComponent);
    component = fixture.componentInstance;
    component.availDevices = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdDeviceSelectionGroupsComponent } from './osd-device-selection-groups.component';
import { InventoryDevicesComponent } from '../../inventory/inventory-devices/inventory-devices.component';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

describe('OsdDeviceSelectionGroupsComponent', () => {
  let component: OsdDeviceSelectionGroupsComponent;
  let fixture: ComponentFixture<OsdDeviceSelectionGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
      ],
      declarations: [ OsdDeviceSelectionGroupsComponent, InventoryDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdDeviceSelectionGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

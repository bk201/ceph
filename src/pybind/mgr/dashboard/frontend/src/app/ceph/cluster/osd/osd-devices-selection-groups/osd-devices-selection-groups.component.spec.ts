import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryDevicesComponent } from '../../inventory/inventory-devices/inventory-devices.component';
import { OsdDevicesSelectionGroupsComponent } from './osd-devices-selection-groups.component';

describe('OsdDevicesSelectionGroupsComponent', () => {
  let component: OsdDevicesSelectionGroupsComponent;
  let fixture: ComponentFixture<OsdDevicesSelectionGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SharedModule],
      declarations: [OsdDevicesSelectionGroupsComponent, InventoryDevicesComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdDevicesSelectionGroupsComponent);
    component = fixture.componentInstance;
    component.availDevices = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

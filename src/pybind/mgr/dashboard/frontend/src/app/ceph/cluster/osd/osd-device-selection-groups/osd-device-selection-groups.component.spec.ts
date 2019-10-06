import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdDeviceSelectionGroupsComponent } from './osd-device-selection-groups.component';

describe('OsdDeviceSelectionGroupsComponent', () => {
  let component: OsdDeviceSelectionGroupsComponent;
  let fixture: ComponentFixture<OsdDeviceSelectionGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsdDeviceSelectionGroupsComponent ]
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

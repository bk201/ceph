import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdDevicesSelectionModalComponent } from './osd-devices-selection-modal.component';

describe('OsdDevicesSelectionModalComponent', () => {
  let component: OsdDevicesSelectionModalComponent;
  let fixture: ComponentFixture<OsdDevicesSelectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsdDevicesSelectionModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdDevicesSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

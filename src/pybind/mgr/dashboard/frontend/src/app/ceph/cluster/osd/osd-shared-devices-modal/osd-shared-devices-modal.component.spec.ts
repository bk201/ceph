import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdSharedDevicesModalComponent } from './osd-shared-devices-modal.component';

describe('OsdSharedDevicesModalComponent', () => {
  let component: OsdSharedDevicesModalComponent;
  let fixture: ComponentFixture<OsdSharedDevicesModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsdSharedDevicesModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdSharedDevicesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

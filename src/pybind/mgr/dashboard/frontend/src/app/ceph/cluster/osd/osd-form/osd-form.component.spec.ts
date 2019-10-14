import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdFormComponent } from './osd-form.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OsdDeviceSelectionGroupsComponent } from '../osd-device-selection-groups/osd-device-selection-groups.component';
import { InventoryDevicesComponent } from '../../inventory/inventory-devices/inventory-devices.component';
import { i18nProviders } from '../../../../../testing/unit-test-helper';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('OsdFormComponent', () => {
  let component: OsdFormComponent;
  let fixture: ComponentFixture<OsdFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        SharedModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [i18nProviders],
      declarations: [
        OsdFormComponent,
        OsdDeviceSelectionGroupsComponent,
        InventoryDevicesComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

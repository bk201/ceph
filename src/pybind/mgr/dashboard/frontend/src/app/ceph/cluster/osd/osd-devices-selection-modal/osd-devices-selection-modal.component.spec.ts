import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { i18nProviders } from '../../../../../testing/unit-test-helper';
import { SharedModule } from '../../../../shared/shared.module';
import { InventoryDevicesComponent } from '../../inventory/inventory-devices/inventory-devices.component';
import { OsdDevicesSelectionModalComponent } from './osd-devices-selection-modal.component';

describe('OsdDevicesSelectionModalComponent', () => {
  let component: OsdDevicesSelectionModalComponent;
  let fixture: ComponentFixture<OsdDevicesSelectionModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, SharedModule, ReactiveFormsModule, RouterTestingModule],
      providers: [BsModalRef, i18nProviders],
      declarations: [OsdDevicesSelectionModalComponent, InventoryDevicesComponent]
    }).compileComponents();
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

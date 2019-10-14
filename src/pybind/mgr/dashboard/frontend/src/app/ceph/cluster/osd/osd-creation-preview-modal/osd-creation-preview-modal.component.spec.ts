import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { i18nProviders } from '../../../../../testing/unit-test-helper';
import { SharedModule } from '../../../../shared/shared.module';
import { DriveGroup } from '../osd-form/osd-form-data';
import { OsdCreationPreviewModalComponent } from './osd-creation-preview-modal.component';

describe('OsdCreationPreviewModalComponent', () => {
  let component: OsdCreationPreviewModalComponent;
  let fixture: ComponentFixture<OsdCreationPreviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule, SharedModule, RouterTestingModule],
      providers: [BsModalRef, i18nProviders],
      declarations: [OsdCreationPreviewModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdCreationPreviewModalComponent);
    component = fixture.componentInstance;
    component.driveGroup = new DriveGroup();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

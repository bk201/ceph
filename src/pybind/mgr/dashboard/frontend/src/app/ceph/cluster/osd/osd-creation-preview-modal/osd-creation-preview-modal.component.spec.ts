import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdCreationPreviewModalComponent } from './osd-creation-preview-modal.component';

describe('OsdCreationPreviewModalComponent', () => {
  let component: OsdCreationPreviewModalComponent;
  let fixture: ComponentFixture<OsdCreationPreviewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OsdCreationPreviewModalComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OsdCreationPreviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

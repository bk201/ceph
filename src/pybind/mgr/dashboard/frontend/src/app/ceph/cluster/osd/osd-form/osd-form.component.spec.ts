import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OsdFormComponent } from './osd-form.component';

describe('OsdFormComponent', () => {
  let component: OsdFormComponent;
  let fixture: ComponentFixture<OsdFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OsdFormComponent ]
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

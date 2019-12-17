import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrchestratorModalComponent } from './orchestrator-modal.component';

describe('OrchestratorModalComponent', () => {
  let component: OrchestratorModalComponent;
  let fixture: ComponentFixture<OrchestratorModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrchestratorModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrchestratorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

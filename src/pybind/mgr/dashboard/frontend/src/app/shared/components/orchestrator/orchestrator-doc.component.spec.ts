import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrchestratorComponentDoc } from './orchestrator-doc.component';

describe('OrchestratorComponent', () => {
  let component: OrchestratorComponentDoc;
  let fixture: ComponentFixture<OrchestratorComponentDoc>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrchestratorComponentDoc ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrchestratorComponentDoc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

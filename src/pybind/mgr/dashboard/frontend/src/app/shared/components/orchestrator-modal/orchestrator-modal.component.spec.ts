import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { BsModalRef } from 'ngx-bootstrap/modal';

import { configureTestBed, i18nProviders } from '../../../../testing/unit-test-helper';
import { ComponentsModule } from '../components.module';
import { OrchestratorModalComponent } from './orchestrator-modal.component';

describe('OrchestratorModalComponent', () => {
  let component: OrchestratorModalComponent;
  let fixture: ComponentFixture<OrchestratorModalComponent>;

  configureTestBed({
    imports: [ComponentsModule, HttpClientTestingModule, RouterTestingModule],
    providers: [BsModalRef, i18nProviders]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrchestratorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

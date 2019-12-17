import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { configureTestBed, i18nProviders } from '../../../../testing/unit-test-helper';
import { CephReleaseNamePipe } from '../../pipes/ceph-release-name.pipe';
import { SummaryService } from '../../services/summary.service';
import { ComponentsModule } from '../components.module';
import { OrchestratorDocComponent } from './orchestrator-doc.component';

describe('OrchestratorComponent', () => {
  let component: OrchestratorDocComponent;
  let fixture: ComponentFixture<OrchestratorDocComponent>;

  configureTestBed({
    imports: [ComponentsModule, HttpClientTestingModule, RouterTestingModule],
    providers: [CephReleaseNamePipe, SummaryService, i18nProviders]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrchestratorDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';

import { configureTestBed, i18nProviders } from '../../../../testing/unit-test-helper';
import { CoreModule } from '../../../core/core.module';
import { HostService } from '../../../shared/api/host.service';
import { Permissions } from '../../../shared/models/permissions';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';
import { SharedModule } from '../../../shared/shared.module';
import { CephModule } from '../../ceph.module';
import { CephSharedModule } from '../../shared/ceph-shared.module';
import { HostsComponent } from './hosts.component';
import { OrchestratorFeature } from '../../../shared/models/orchestrator.enum';
import { OrchestratorService } from '../../../shared/api/orchestrator.service';
import { TableActionsComponent } from '../../../shared/datatable/table-actions/table-actions.component';
import { By } from '@angular/platform-browser';
import { CdTableAction } from '../../../shared/models/cd-table-action';
import { CdTableSelection } from '../../../shared/models/cd-table-selection';

describe('HostsComponent', () => {
  let component: HostsComponent;
  let fixture: ComponentFixture<HostsComponent>;
  let hostListSpy: jasmine.Spy;
  let orchStatusSpy: jasmine.Spy;
  let orchService: OrchestratorService;

  const fakeAuthStorageService = {
    getPermissions: () => {
      return new Permissions({ hosts: ['read', 'update', 'create', 'delete'] });
    }
  };

  const mockOrchStatus = (available: boolean, features?: OrchestratorFeature[]) => {
    const orchStatus = { available: available, description: '', features: { } };
    if (features) {
      features.forEach((feature: OrchestratorFeature) => {
        orchStatus.features[feature] = { available: true };
      });
    }
    orchStatusSpy.and.callFake(() => of(orchStatus));
  };

  configureTestBed({
    imports: [
      BrowserAnimationsModule,
      CephSharedModule,
      SharedModule,
      HttpClientTestingModule,
      RouterTestingModule,
      ToastrModule.forRoot(),
      CephModule,
      CoreModule
    ],
    providers: [
      { provide: AuthStorageService, useValue: fakeAuthStorageService },
      i18nProviders,
      TableActionsComponent
    ],
    declarations: []
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostsComponent);
    component = fixture.componentInstance;
    hostListSpy = spyOn(TestBed.inject(HostService), 'list');
    orchService = TestBed.inject(OrchestratorService);
    orchStatusSpy = spyOn(orchService, 'status');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hosts list even with not permission mapped services', async () => {
    const hostname = 'ceph.dev';
    const payload = [
      {
        services: [
          {
            type: 'osd',
            id: '0'
          },
          {
            type: 'rgw',
            id: 'rgw'
          },
          {
            type: 'notPermissionMappedService',
            id: '1'
          }
        ],
        hostname: hostname,
        ceph_version: 'ceph version Development',
        labels: ['foo', 'bar']
      }
    ];

    mockOrchStatus(true);
    hostListSpy.and.callFake(() => of(payload));
    fixture.detectChanges();

    await fixture.whenStable();
      fixture.detectChanges();

      const spans = fixture.debugElement.nativeElement.querySelectorAll(
        '.datatable-body-cell-label span'
      );
      expect(spans[0].textContent).toBe(hostname);
  });

  describe('table actions', () => {
    const fakeHosts = require('./fixtures/host_list_response.json');

    const verifyTableActons = async (
      orch: boolean,
      features: OrchestratorFeature[],
      expectResults: any[]
    ) => {
      hostListSpy.and.callFake(() => of(fakeHosts));
      mockOrchStatus(orch, features);
      fixture.detectChanges();
      await fixture.whenStable();

      for (let i = 0; i < expectResults.length; i++) {
        if (i > 0) {
          component.selection = new CdTableSelection();
          component.selection.selected = [fakeHosts[i - 1]];
        }
        const dropDownToggle = fixture.debugElement.query(By.css('.dropdown-toggle'));
        dropDownToggle.triggerEventHandler('click', null);
        fixture.detectChanges();
        await fixture.whenStable();

        const tableActionElement = fixture.debugElement.query(By.directive(TableActionsComponent));
        const toClassName = TestBed.inject(TableActionsComponent).toClassName;
        const getActionElement = (action: CdTableAction) =>
          tableActionElement.query(By.css(`[ngbDropdownItem].${toClassName(action.name)}`));

        const actions = {};
        component.tableActions.forEach((action) => {
          const actionElement = getActionElement(action);
          actions[action.name] = [actionElement.classes.disabled, actionElement.properties.title];
        });
        expect(actions).toEqual(expectResults[i]);
      }
    };
  
    it('should have correct states when enabling Orchestrator', async () => {
      const expectResults = [
        {
          // No selection
          // Action: [Disabled, DisableDescription]
          Create: [false, ''],
          Edit: [true, ''],
          Delete: [true, '']
        },
        {
          // select row 1
          Create: [false, ''],
          Edit: [true, component.messages.nonOrchHost],
          Delete: [true, component.messages.nonOrchHost]
        },
        {
          // select row 2
          Create: [false, ''],
          Edit: [false, ''],
          Delete: [false, '']
        }
      ];

      const features = [ OrchestratorFeature.HOST_CREATE,
        OrchestratorFeature.HOST_LABEL_ADD,
        OrchestratorFeature.HOST_DELETE,
        OrchestratorFeature.HOST_LABEL_REMOVE
      ];
      await verifyTableActons(true, features, expectResults);
    });

    it('should have correct states when disabling Orchestrator', async () => {
      const expectResults = [
        {
          // Action: [Disabled, DisableDescription]
          Create: [true, orchService.disableMessages.no_orchestrator],
          Edit: [true, ''],
          Delete: [true, '']
        },
        {
          Create: [true, orchService.disableMessages.no_orchestrator],
          Edit: [true, component.messages.nonOrchHost],
          Delete: [true, component.messages.nonOrchHost]
        },
        {
          Create: [true, orchService.disableMessages.no_orchestrator],
          Edit: [true, orchService.disableMessages.no_orchestrator],
          Delete: [true, orchService.disableMessages.no_orchestrator]
        }
      ];
      await verifyTableActons(false, [], expectResults);
    });

    it('should have correct states when disabling Orchestrator features', async () => {
      const expectResults = [
        {
          // Action: [Disabled, DisableDescription]
          Create: [true, orchService.disableMessages.missing_feature],
          Edit: [true, ''],
          Delete: [true, '']
        },
        {
          Create: [true, orchService.disableMessages.missing_feature],
          Edit: [true, component.messages.nonOrchHost],
          Delete: [true, component.messages.nonOrchHost]
        },
        {
          Create: [true, orchService.disableMessages.missing_feature],
          Edit: [true, orchService.disableMessages.missing_feature],
          Delete: [true, orchService.disableMessages.missing_feature]
        }
      ];
      await verifyTableActons(true, [], expectResults);
    });
  });
});

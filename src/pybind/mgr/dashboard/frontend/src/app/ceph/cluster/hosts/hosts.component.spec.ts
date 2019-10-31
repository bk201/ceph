import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ToastrModule } from 'ngx-toastr';
import { of } from 'rxjs';

import { configureTestBed, i18nProviders } from '../../../../testing/unit-test-helper';
import { CoreModule } from '../../../core/core.module';
import { HostService } from '../../../shared/api/host.service';
import { Permissions } from '../../../shared/models/permissions';
import { AuthStorageService } from '../../../shared/services/auth-storage.service';
import { SharedModule } from '../../../shared/shared.module';
import { CephModule } from '../../ceph.module';
import { InventoryDevicesComponent } from '../inventory/inventory-devices/inventory-devices.component';
import { InventoryComponent } from '../inventory/inventory.component';
import { ServicesComponent } from '../services/services.component';
import { HostDetailsComponent } from './host-details/host-details.component';
import { HostsComponent } from './hosts.component';

describe('HostsComponent', () => {
  let component: HostsComponent;
  let fixture: ComponentFixture<HostsComponent>;
  let hostListSpy;

  const fakeAuthStorageService = {
    getPermissions: () => {
      return new Permissions({ hosts: ['read', 'update', 'create', 'delete'] });
    }
  };

  configureTestBed({
    imports: [
      SharedModule,
      HttpClientTestingModule,
      TabsModule.forRoot(),
      BsDropdownModule.forRoot(),
      RouterTestingModule,
      ToastrModule.forRoot(),
      CephModule,
      CoreModule
    ],
    providers: [{ provide: AuthStorageService, useValue: fakeAuthStorageService }, i18nProviders],
    declarations: [
      HostsComponent,
      HostDetailsComponent,
      InventoryComponent,
      InventoryDevicesComponent,
      ServicesComponent
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostsComponent);
    component = fixture.componentInstance;
    hostListSpy = spyOn(TestBed.get(HostService), 'list');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hosts list even with not permission mapped services', async(() => {
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
        ceph_version: 'ceph version Development'
      }
    ];

    hostListSpy.and.callFake(() => of(payload));

    fixture.whenStable().then(() => {
      fixture.detectChanges();

      const spans = fixture.debugElement.nativeElement.querySelectorAll(
        '.datatable-body-cell-label span'
      );
      expect(spans[0].textContent).toBe(hostname);
    });
  }));
});

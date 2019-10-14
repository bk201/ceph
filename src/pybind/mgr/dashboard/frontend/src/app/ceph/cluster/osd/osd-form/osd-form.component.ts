import { Component, OnInit, ViewChild } from '@angular/core';

import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { I18n } from '@ngx-translate/i18n-polyfill';
import * as _ from 'lodash';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { OrchestratorService } from '../../../../shared/api/orchestrator.service';
import { SubmitButtonComponent } from '../../../../shared/components/submit-button/submit-button.component';
import { ActionLabelsI18n } from '../../../../shared/constants/app.constants';
import { Icons } from '../../../../shared/enum/icons.enum';
import { CdFormGroup } from '../../../../shared/forms/cd-form-group';
import { CdTableColumn } from '../../../../shared/models/cd-table-column';
import { CephReleaseNamePipe } from '../../../../shared/pipes/ceph-release-name.pipe';
import { SummaryService } from '../../../../shared/services/summary.service';
import { InventoryDevice } from '../../inventory/inventory-devices/inventory-device.model';
import { InventoryNode } from '../../inventory/inventory-node.model';
import { OsdCreationPreviewModalComponent } from '../osd-creation-preview-modal/osd-creation-preview-modal.component';
import { OsdDevicesSelectionGroupsComponent } from '../osd-devices-selection-groups/osd-devices-selection-groups.component';
import { DriveGroup } from './drive-group.model';
import { OsdFeature } from './osd-feature.interface';

@Component({
  selector: 'cd-osd-form',
  templateUrl: './osd-form.component.html',
  styleUrls: ['./osd-form.component.scss']
})
export class OsdFormComponent implements OnInit {
  @ViewChild('dataDeviceSelectionGroups', { static: false })
  dataDeviceSelectionGroups: OsdDevicesSelectionGroupsComponent;

  @ViewChild('walDeviceSelectionGroups', { static: false })
  walDeviceSelectionGroups: OsdDevicesSelectionGroupsComponent;

  @ViewChild('dbDeviceSelectionGroups', { static: false })
  dbDeviceSelectionGroups: OsdDevicesSelectionGroupsComponent;

  @ViewChild('previewButton', { static: false })
  previewButton: SubmitButtonComponent;

  icons = Icons;

  form: CdFormGroup;
  columns: Array<CdTableColumn> = [];

  loading = false;
  allDevices: InventoryDevice[] = [];

  availDevices: InventoryDevice[] = [];
  dataDeviceFilters = [];
  dbDeviceFilters = [];
  walDeviceFilters = [];
  hostname = '';
  driveGroup = new DriveGroup();

  action: string;
  resource: string;

  features: { [key: string]: OsdFeature };
  featureList: OsdFeature[] = [];

  checkingOrchestrator = true;
  orchestratorExist = false;
  docsUrl: string;

  constructor(
    public actionLabels: ActionLabelsI18n,
    private i18n: I18n,
    private orchService: OrchestratorService,
    private router: Router,
    private bsModalService: BsModalService,
    private summaryService: SummaryService,
    private cephReleaseNamePipe: CephReleaseNamePipe
  ) {
    this.resource = this.i18n('OSDs');
    this.action = this.actionLabels.CREATE;
    this.features = {
      encrypted: {
        key: 'encrypted',
        desc: this.i18n('Encryption')
      }
    };
    this.featureList = _.map(this.features, (o, key) => Object.assign(o, { key: key }));
    this.createForm();
  }

  ngOnInit() {
    const subs = this.summaryService.subscribe((summary: any) => {
      if (!summary) {
        return;
      }

      const releaseName = this.cephReleaseNamePipe.transform(summary.version);
      this.docsUrl = `http://docs.ceph.com/docs/${releaseName}/mgr/orchestrator_cli/`;

      setTimeout(() => {
        subs.unsubscribe();
      }, 0);
    });

    this.orchService.status().subscribe((data: { available: boolean }) => {
      this.orchestratorExist = data.available;
      this.checkingOrchestrator = false;
      if (this.orchestratorExist) {
        this.getDataDevices();
      }
    });

    this.form.get('walSlots').valueChanges.subscribe((value) => this.setSlots('wal', value));
    this.form.get('dbSlots').valueChanges.subscribe((value) => this.setSlots('db', value));
    _.each(this.features, (feature) => {
      this.form
        .get('features')
        .get(feature.key)
        .valueChanges.subscribe((value) => this.featureFormUpdate(feature.key, value));
    });
  }

  createForm() {
    this.form = new CdFormGroup({
      walSlots: new FormControl(0, {
        updateOn: 'blur',
        validators: [Validators.min(0)]
      }),
      dbSlots: new FormControl(0, {
        updateOn: 'blur',
        validators: [Validators.min(0)]
      }),
      features: new CdFormGroup(
        this.featureList.reduce((acc, e) => {
          // disable initially because no data devices are selected
          acc[e.key] = new FormControl({ value: false, disabled: true });
          return acc;
        }, {})
      )
    });
  }

  getDataDevices() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.orchService.inventoryList('').subscribe(
      (data: InventoryNode[]) => {
        const devices: InventoryDevice[] = [];
        data.forEach((node: InventoryNode) => {
          node.devices.forEach((device: InventoryDevice) => {
            device.hostname = node.name;
            device.uid = `${node.name}-${device.id}`;
            if (device.dev_id) {
              device.vendor = device.dev_id.split('/')[0];
              device.model = device.dev_id.split('/')[1];
            }
            if (device.available) {
              devices.push(device);
            }
          });
        });
        this.allDevices = devices;
        this.availDevices = [...devices];
        this.loading = false;
      },
      () => {
        this.allDevices = [];
        this.availDevices = [];
        this.loading = false;
      }
    );
  }

  setSlots(type: string, slots: number) {
    if (typeof slots !== 'number') {
      return;
    }
    if (slots >= 0) {
      this.driveGroup.setSlots(type, slots);
    }
  }

  featureFormUpdate(key: string, checked: boolean) {
    this.driveGroup.setFeature(key, checked);
  }

  enableFeatures() {
    this.featureList.forEach((feature) => {
      this.form.get(feature.key).enable({ emitEvent: false });
    });
  }

  disableFeatures() {
    this.featureList.forEach((feature) => {
      const control = this.form.get(feature.key);
      control.disable({ emitEvent: false });
      control.setValue(false, { emitEvent: false });
    });
  }

  onDevicesSelected(event) {
    this.availDevices = event.filterOutDevices;

    if (event.type === 'data') {
      // If user selects data devices for a single host, make only remaining devices on
      // that host as available.
      const hostnameFilter = _.find(event.filters, { prop: 'hostname' });
      if (hostnameFilter) {
        this.hostname = hostnameFilter.value;
        this.availDevices = event.filterOutDevices.filter((device: InventoryDevice) => {
          return device.hostname === this.hostname;
        });
        this.driveGroup.setHostPattern(this.hostname);
      } else {
        this.driveGroup.setHostPattern('*');
      }
      this.enableFeatures();
    }
    this.driveGroup.setDeviceSelection(event.type, event.filters);
  }

  onDevicesCleared(event) {
    if (event.type === 'data') {
      this.availDevices = [...this.allDevices];
      this.walDeviceSelectionGroups.devices = [];
      this.dbDeviceSelectionGroups.devices = [];
      this.disableFeatures();
      this.driveGroup.reset();
      this.form.get('walSlots').setValue(0, { emitEvent: false });
      this.form.get('dbSlots').setValue(0, { emitEvent: false });
    } else {
      this.availDevices = [...this.availDevices, ...event.clearedDevices];
      this.driveGroup.clearDeviceSelection(event.type);
      const slotControlName = `${event.type}Slots`;
      this.form.get(slotControlName).setValue(0, { emitEvent: false });
    }
  }

  submit() {
    let allHosts = [];
    if (this.hostname === '') {
      // wildcard * to match all hosts, provide hosts we can see
      allHosts = _.sortedUniq(_.map(this.allDevices, 'hostname').sort());
    } else {
      allHosts = [this.hostname];
    }
    const options: ModalOptions = {
      initialState: {
        driveGroup: this.driveGroup,
        allHosts: allHosts
      }
    };
    const modalRef = this.bsModalService.show(OsdCreationPreviewModalComponent, options);
    modalRef.content.submitAction.subscribe(() => {
      this.router.navigate(['/osd']);
    });
    this.previewButton.loading = false;
  }
}

import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { OrchestratorService } from '../../../shared/api/orchestrator.service';
import { Icons } from '../../../shared/enum/icons.enum';
import { CephReleaseNamePipe } from '../../../shared/pipes/ceph-release-name.pipe';
import { SummaryService } from '../../../shared/services/summary.service';
import { InventoryDevice } from './inventory-devices/inventory-device.model';
import * as _ from 'lodash';

@Component({
  selector: 'cd-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnChanges, OnInit {
  // Display inventory page only for this hostname, ignore to display all.
  @Input() hostname?: string;

  icons = Icons;

  checkingOrchestrator = true;
  orchestratorExist = false;
  docsUrl: string;

  devices: Array<InventoryDevice> = [];

  constructor(
    private cephReleaseNamePipe: CephReleaseNamePipe,
    private orchService: OrchestratorService,
    private summaryService: SummaryService
  ) {}

  ngOnInit() {
    // duplicated code with grafana
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
    });
  }

  ngOnChanges() {
    if (this.orchestratorExist) {
      this.devices = [];
      this.getInventory();
    }
  }

  getInventory() {
    if (this.hostname === '') {
      return;
    }
    this.orchService.inventoryDeviceList(this.hostname).subscribe(
      (devices: InventoryDevice[]) => {
        this.devices = devices;
        // for (let i=10; i<200; i++) {
        //   const tmp = _.clone(devices[0]);
        //   tmp.hostname = `node-${i}`;
        //   tmp.uid = `${tmp.hostname}-${tmp.path}`;
        //   this.devices.push(tmp);
        // }
      },
      () => {
        this.devices = [];
      }
    );
  }

  refresh() {
    this.getInventory();
  }
}

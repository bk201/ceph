import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { OrchestratorService } from '../../../shared/api/orchestrator.service';
import { Icons } from '../../../shared/enum/icons.enum';
import { CephReleaseNamePipe } from '../../../shared/pipes/ceph-release-name.pipe';
import { SummaryService } from '../../../shared/services/summary.service';
import { InventoryDevice } from './inventory-devices/inventory-device.model';
import { InventoryNode } from './inventory-node.model';

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
  isLoadingDevices = false;

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

      if (this.orchestratorExist) {
        this.getInventory();
      }
    });
  }

  ngOnChanges() {
    if (this.orchestratorExist) {
      this.devices = [];
      this.getInventory();
    }
  }

  getInventory() {
    if (this.isLoadingDevices) {
      return;
    }
    this.isLoadingDevices = true;
    if (this.hostname === '') {
      this.isLoadingDevices = false;
      return;
    }
    this.orchService.inventoryList(this.hostname).subscribe(
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
            devices.push(device);
          });
        });
        this.devices = devices;
        this.isLoadingDevices = false;
      },
      () => {
        this.isLoadingDevices = false;
        this.devices = [];
      }
    );
  }
}

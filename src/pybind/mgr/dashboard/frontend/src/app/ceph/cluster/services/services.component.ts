import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';

import { OrchestratorService } from '../../../shared/api/orchestrator.service';
import { TableComponent } from '../../../shared/datatable/table/table.component';
import { CdTableColumn } from '../../../shared/models/cd-table-column';
import { CdTableFetchDataContext } from '../../../shared/models/cd-table-fetch-data-context';
import { Service } from './services.model';

@Component({
  selector: 'cd-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnChanges, OnInit {
  @ViewChild(TableComponent, { static: false })
  table: TableComponent;

  @Input() hostname: string;

  // Do not display these columns
  @Input() hiddenColumns: string[] = [];

  checkingOrchestrator = true;
  orchestratorExist = false;
  hasOrchestrator = false;
  docsUrl: string;

  columns: Array<CdTableColumn> = [];
  services: Array<Service> = [];
  isLoadingServices = false;

  constructor(private i18n: I18n, private orchService: OrchestratorService) {}

  ngOnInit() {
    const columns = [
      {
        name: this.i18n('Hostname'),
        prop: 'nodename',
        flexGrow: 2
      },
      {
        name: this.i18n('Service type'),
        prop: 'service_type',
        flexGrow: 1
      },
      {
        name: this.i18n('Service'),
        prop: 'service',
        flexGrow: 1
      },
      {
        name: this.i18n('Service instance'),
        prop: 'service_instance',
        flexGrow: 1
      },
      {
        name: this.i18n('Container id'),
        prop: 'container_id',
        flexGrow: 3
      },
      {
        name: this.i18n('Version'),
        prop: 'version',
        flexGrow: 1
      },
      {
        name: this.i18n('Rados config location'),
        prop: 'rados_config_location',
        flexGrow: 1
      },
      {
        name: this.i18n('Service URL'),
        prop: 'service_url',
        flexGrow: 2
      },
      {
        name: this.i18n('Status'),
        prop: 'status',
        flexGrow: 1
      },
      {
        name: this.i18n('Status Description'),
        prop: 'status_desc',
        flexGrow: 1
      }
    ];

    this.columns = columns.filter((col: any) => {
      return !this.hiddenColumns.includes(col.prop);
    });

    this.orchService.status().subscribe((status) => {
      this.hasOrchestrator = status.available;
    });
  }

  ngOnChanges() {
    if (this.orchestratorExist) {
      this.services = [];
      this.table.reloadData();
    }
  }

  getServices(context: CdTableFetchDataContext) {
    if (this.isLoadingServices) {
      return;
    }
    this.isLoadingServices = true;
    this.orchService.serviceList(this.hostname).subscribe(
      (data: Service[]) => {
        const services: Service[] = [];
        data.forEach((service: Service) => {
          service.uid = `${service.nodename}-${service.service_type}-${service.service}-${service.service_instance}`;
          services.push(service);
        });
        this.services = services;
        this.isLoadingServices = false;
      },
      () => {
        this.isLoadingServices = false;
        this.services = [];
        context.error();
      }
    );
  }
}

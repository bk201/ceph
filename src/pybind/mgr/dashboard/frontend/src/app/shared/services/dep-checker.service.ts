import { Injectable } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';

import { OrchestratorService } from '../api/orchestrator.service';
import { OrchestratorModalComponent } from '../components/orchestrator-modal/orchestrator-modal.component';

@Injectable({
  providedIn: 'root'
})
export class DepCheckerService {

  constructor(
    private orchService: OrchestratorService,
    private modalService: BsModalService
  ) { }

  checkOrchestratorOrModal(actionDescription: string, itemDescription: string, func: Function) {
    this.orchService.status().subscribe((status) => {
      if (status.available) {
        func();
      } else {
        this.modalService.show(
          OrchestratorModalComponent,
          {
            initialState: {
              actionDescription: actionDescription,
              itemDescription: itemDescription
            }
          }
        );
      }
    });
  }
}

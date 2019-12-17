import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'cd-orchestrator-modal',
  templateUrl: './orchestrator-modal.component.html',
  styleUrls: ['./orchestrator-modal.component.scss']
})
export class OrchestratorModalComponent implements OnInit {
  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit() {}

  onSubmit() {
    this.bsModalRef.hide();
  }
}

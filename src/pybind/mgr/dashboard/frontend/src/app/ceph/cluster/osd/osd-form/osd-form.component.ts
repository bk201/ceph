import { Component, OnInit } from '@angular/core';

import { I18n } from '@ngx-translate/i18n-polyfill';
import { ActionLabelsI18n } from '../../../../shared/constants/app.constants';
import { CdFormGroup } from '../../../../shared/forms/cd-form-group';


@Component({
  selector: 'cd-osd-form',
  templateUrl: './osd-form.component.html',
  styleUrls: ['./osd-form.component.scss']
})
export class OsdFormComponent implements OnInit {

  osdForm: CdFormGroup;

  action: string;
  resource: string;

  constructor(
    private i18n: I18n,
    public actionLabels: ActionLabelsI18n,
  ) {
    this.resource = this.i18n('OSD');
    this.action = this.actionLabels.CREATE;
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.osdForm = new CdFormGroup(
      {}
    )
  }

}

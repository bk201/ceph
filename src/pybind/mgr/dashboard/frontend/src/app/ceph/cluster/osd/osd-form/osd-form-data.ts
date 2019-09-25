import { Validators } from '@angular/forms';

import { I18n } from '@ngx-translate/i18n-polyfill';
import { SelectOption } from '../../../../shared/components/select/select-option.model';
import { SelectMessages } from '../../../../shared/components/select/select-messages.model';


export class OsdFormData {
  dbDevices: any;
  walDevices: any;

  constructor(i18n: I18n) {
    this.dbDevices = {
      selected: [],
      available: [
        new SelectOption(false, 'a', 'ssss'),
        new SelectOption(false, 'b', ''),
        new SelectOption(false, 'c', '')
      ],
      validators: [Validators.pattern('[A-Za-z0-9_]+'), Validators.maxLength(128)],
      messages: new SelectMessages(
        {
          empty: i18n('No devices added'),
          selectionLimit: {
            text: i18n('Applications limit reached'),
            tooltip: i18n('A pool can only have up to four applications definitions.')
          },
          customValidations: {
            pattern: i18n(`Allowed characters '_a-zA-Z0-9'`),
            maxlength: i18n('Maximum length is 128 characters')
          },
          filter: i18n('Filter or add applications'),
          add: i18n('Add application')
        },
        i18n
      )
    };
    this.walDevices = {
      selected: [],
      available: [
        new SelectOption(false, 'a', 'ssss'),
        new SelectOption(false, 'b', ''),
        new SelectOption(false, 'c', '')
      ],
      validators: [Validators.pattern('[A-Za-z0-9_]+'), Validators.maxLength(128)],
      messages: new SelectMessages(
        {
          empty: i18n('No devices added'),
          selectionLimit: {
            text: i18n('Applications limit reached'),
            tooltip: i18n('A pool can only have up to four applications definitions.')
          },
          customValidations: {
            pattern: i18n(`Allowed characters '_a-zA-Z0-9'`),
            maxlength: i18n('Maximum length is 128 characters')
          },
          filter: i18n('Filter or add applications'),
          add: i18n('Add application')
        },
        i18n
      )
    };
  }
}

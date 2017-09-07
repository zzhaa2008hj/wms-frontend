import { autoinject } from 'aurelia-dependency-injection';
import { DialogController } from 'ui';
import { Organization } from '@app/base/models/organization';

@autoinject
export class PrintAddress {

  organization: Organization;

  constructor(private dialogController: DialogController) {

  }

  async activate(org: Organization) {
    this.organization = org;
  }

  async save() {    
    await this.dialogController.ok(this.organization);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
/**
 * Created by shun on 2017/6/20.
 */
import {autoinject} from "aurelia-dependency-injection";
import {OrganizationRole} from "../models/organization-role";
import { DialogController, DialogService } from "ui";

@autoinject
export class OrganizationRoleEdit {

  organizationRole: OrganizationRole;
  constructor(private dialogController: DialogController) {
  }

  async activate(organizationRole: OrganizationRole) {
    this.organizationRole = organizationRole;
  }

  async save() {
    await this.dialogController.ok(this.organizationRole);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
/**
 * Created by shun on 2017/6/20.
 */
import {autoinject, inject, newInstance} from "aurelia-dependency-injection";
import {OrganizationRole} from "../models/organization-role";
import { DialogController, DialogService } from "ui";
import { ValidationController , ValidationRules } from "aurelia-validation";
import { formValidationRenderer } from "../../validation/support";

export class OrganizationRoleAdd {

  organizationRole = {} as OrganizationRole;
  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate() {
    this.validationController.addObject(this.organizationRole, validationRules);
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.organizationRole);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure((role: OrganizationRole)  => role.name)
  .displayName('角色名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;
/**
 * Created by shun on 2017/6/20.
 */
import {inject, newInstance} from "aurelia-dependency-injection";
import {OrganizationRole} from "@app/base/models/organization-role";
import { DialogController} from "ui";
import { ValidationController , ValidationRules } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

export class OrganizationRoleEdit {

  organizationRole: OrganizationRole;
  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate(organizationRole: OrganizationRole) {
    this.organizationRole = organizationRole;
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
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { inject, newInstance } from 'aurelia-dependency-injection';
import { Organization, orgValidationRules } from '@app/base/models/organization';
import { OrganizationService } from '@app/base/services/organization';
import { ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { ConstantValues } from '@app/common/models/constant-values';

export class EditHandlingCustomer {
  org: Organization;
  orgProperties = ConstantValues.OrgProperties;
  
  constructor(@inject private router: Router,
              @inject private orgService: OrganizationService,
              @inject private messageDialogService: MessageDialogService,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.org = await this.orgService.getOrganization(id);
    this.validationController.addObject(this.org, orgValidationRules);
  }

  async update() {
    if (this.org.orgProperty == 1) {
      this.org.shortName = this.org.name;
    }
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      await this.orgService.updateOrganization(this.org.id, this.org);
      await this.messageDialogService.alert({ title: "编辑成功" });
      this.cancel();
    } catch (err) {
      await this.messageDialogService.alert({ title: "发生错误", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { inject, newInstance } from "aurelia-dependency-injection";
import { OrganizationService } from "../../services/organization";
import { Organization } from "../../models/organization";


export class EditOrganization {
  org: Organization;

  constructor(@inject private router: Router,
              @inject private orgService: OrganizationService,
              @newInstance() private validationController: ValidationController,
              @inject private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.org = await this.orgService.getOrganization(id);
  }

  async update() {
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

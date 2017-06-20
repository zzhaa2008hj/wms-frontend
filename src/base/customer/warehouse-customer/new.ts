import { Router } from "aurelia-router";
import { autoinject, newInstance } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { Organization } from "../../models/organization";
import { OrganizationService } from "../../services/organization";
import { ValidationController } from "aurelia-validation";

@autoinject
export class NewOrganization {
  org: Organization;

  constructor(private router: Router,
              private orgService: OrganizationService,
              @newInstance() private validationController: ValidationController,
              private messageDialogService: MessageDialogService) {
  }

  async save() {
    try {
      await this.orgService.saveOrganization(this.org, '1');
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

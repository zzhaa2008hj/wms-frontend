import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { Organization } from "@app/base/models/organization";
import { OrganizationService } from "@app/base/services/organization";

@autoinject
export class NewWareHouseCustomer {
  org: Organization;

  constructor(private router: Router,
              private orgService: OrganizationService,
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

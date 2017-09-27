import { Router } from "aurelia-router";
import { autoinject, Container } from 'aurelia-dependency-injection';
import { MessageDialogService } from "ui";
import { Organization, orgValidationRules } from '@app/base/models/organization';
import { OrganizationService } from "@app/base/services/organization";
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';

@autoinject
export class NewWareHouseCustomer {
  org = {} as Organization;
  validationController: ValidationController;

  constructor(private router: Router,
              private orgService: OrganizationService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  /**
  * 初始化后自动执行
  */
  async activate() {
    //对象验证错误
    this.validationController.addObject(this.org, orgValidationRules);
  }
  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
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

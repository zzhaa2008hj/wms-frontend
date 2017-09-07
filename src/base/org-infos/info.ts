import { autoinject, Container } from 'aurelia-dependency-injection';
import { OrganizationService } from '@app/base/services/organization';
import { UserSession } from '@app/user';
import { Organization } from '@app/base/models/organization';
import { ValidationControllerFactory, ValidationController } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { MessageDialogService, DialogService } from 'ui';
import { PrintAddress } from '@app/base/org-infos/print-address/add';

@autoinject
export class OrgInfo {

  org: Organization = {} as Organization;
  validationController: ValidationController;
  edit = false;

  constructor(private orgService: OrganizationService, 
              private user: UserSession,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    //渲染错误信息
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  async activate() {
    this.getOrg();
  }

  async getOrg() {
    try {
      this.org = await this.orgService.getOrganization(this.user.userInfo.organizationId);
    } catch (err) {
      await this.messageDialogService.alert({ title: "失败", message: err.message, icon: 'error' });
    }
  }

  openEdit() {
    this.edit = true;
  }

  async save() {
    this.edit = false;
    try {
      await this.orgService.updateOrganization(this.org.id, this.org);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.getOrg();
    } catch (err) {
      await this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
      this.edit = true;
    }
  }

  cancel() {
    this.edit = false;
  }

  async setPrintAddress() {
    let result = await this.dialogService.open({ viewModel: PrintAddress, model: this.org, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let organization = result.output;
    try {
      await this.orgService.updateOrganization(this.org.id, organization);
      await this.messageDialogService.alert({ title: "设置成功", message: "设置成功" });
      this.getOrg();
    } catch (err) {
      await this.messageDialogService.alert({ title: "设置失败", message: err.message, icon: "error" });
    }
  }
}
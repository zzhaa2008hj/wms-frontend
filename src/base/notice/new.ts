import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Notice } from "@app/base/models/notice";
import { NoticeService } from "@app/base/services/notice";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewNotice {
  notice: Notice = {} as Notice;
  validationController: ValidationController;

  constructor(private router: Router,
              private noticeService: NoticeService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory, container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
    this.notice.category = 1;
  }

  async addNewNotice() {
    try {
      this.notice.visible = 1;

      this.validationController.addObject(this.notice, validationRules);
      let { valid } = await this.validationController.validate();
      if (!valid) return;

      await this.noticeService.saveNotice(this.notice);
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

const validationRules = ValidationRules
  .ensure((notice: Notice) => notice.title)
  .displayName('标题')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;
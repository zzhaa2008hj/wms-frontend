import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { autoinject, Container } from "aurelia-dependency-injection";
import { Notice } from "@app/base/models/notice";
import { NoticeService } from "@app/base/services/notice";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
import { observable } from 'aurelia-framework';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewNotice {
  @observable disabled: boolean = false;
  notice: Notice = {} as Notice;
  validationController: ValidationController;

  tools = [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    'justifyFull',
    'insertUnorderedList',
    'insertOrderedList',
    'indent',
    'outdent',
    'createLink',
    'unlink',
    'insertImage',
    'subscript',
    'superscript',
    'createTable',
    'addRowAbove',
    'addRowBelow',
    'addColumnLeft',
    'addColumnRight',
    'deleteRow',
    'deleteColumn',
    'formatting',
  ];

  resizable = {
    content: true,
    toolbar: true
  };

  @observable editor: any;

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
    this.notice.content = this.editor.value();

    this.validationController.addObject(this.notice, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      this.notice.visible = 1;
      await this.noticeService.saveNotice(this.notice);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;
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

  .ensure((notice: Notice) => notice.content)
  .displayName('内容')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(2000).withMessage(`\${$displayName} 长度不能大于2000`)
  .rules;
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { formValidationRenderer } from '@app/validation/support';
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { Organization } from '@app/base/models/organization';
import { OrganizationService } from '@app/base/services/organization';
import { autoinject, Container } from 'aurelia-dependency-injection';

@autoinject
export class NewHandlingCustomer {
  org = {} as Organization;
  validationController: ValidationController;

  constructor(private router: Router,
    private orgService: OrganizationService,
    private messageDialogService: MessageDialogService,
    validationControllerFactory: ValidationControllerFactory,
    container: Container) {
    //渲染错误信息
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
  }

  /**
    * 初始化后自动执行
    */
  async activate() {
    //对象验证错误
    this.validationController.addObject(this.org, validationRules);
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      await this.orgService.saveOrganization(this.org, '2');
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
  .ensure((org: Organization) => org.name)
  .displayName('机构名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.shortName)
  .displayName('机构简称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.contactPerson)
  .displayName('联系人')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.contactMobile)
  .displayName('联系人手机')
  .required().withMessage(`\${$displayName} 不能为空`)
  .matches(/^0?(1[358][0-9]|17[05678]|15[012356789]|18[02356789]|14[57])[0-9]{8}$/)
  .withMessage(`'\${$value}' 不是有效的 \${$displayName}`)
  
  .ensure((org: Organization) => org.organizationCode)
  .displayName('组织机构代码')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.email)
  .displayName('邮箱')
  .matches(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/)
  .withMessage(`'\${$value}' 不是有效的 \${$displayName}`)

  .ensure((org: Organization) => org.address)
  .displayName('地址')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.description)
  .displayName('机构描述')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.registerCode)
  .displayName('注册代码')
  .maxLength(250).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.legalPerson)
  .displayName('法人')
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((org: Organization) => org.faxNumber)
  .displayName('传真号码')
  .maxLength(250).withMessage(`\${$displayName} 过长`)
  
  .ensure((org: Organization) => org.remark)
  .displayName('备注')
  .maxLength(250).withMessage(`\${$displayName} 过长`)
  .rules;
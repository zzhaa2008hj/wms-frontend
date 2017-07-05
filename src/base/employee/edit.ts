import {inject, newInstance} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "@app/base/services/employee";
import {Organization} from "@app/base/models/organization";
import {Employee} from "@app/base/models/employee";
import {DialogService} from "ui";
import {ValidationController, ValidationRules } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

export class EmployeeEdit {

  id: string;
  organizations: Organization [];
  employee: Employee;

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    this.validationController.addObject(this.employee, validationRules);
    this.id = params.id;
    this.employee = await this.employeeService.getEmployee(this.id);
  }

  async doSave() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      await this.employeeService.updateEmployee(this.id, this.employee);
      await this.dialogService.alert({title: "", message: "编辑成功！"});
      this.goBack();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  goBack() {
    this.router.navigateToRoute('list');
  }

}

const validationRules = ValidationRules
  .ensure((e: Employee)  => e.name)
  .displayName('员工姓名')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(20).withMessage(`\${$displayName} 长度不能超过20`)

  .ensure((e: Employee)  => e.email)
  .displayName('邮箱')
  .email().withMessage(`\${$displayName} 格式错误`)
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((e: Employee)  => e.mobile)
  .displayName('手机号码')
  .required().withMessage(`\${$displayName} 不能为空`)
  .matches(/^1[0-9]{10}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.idcard)
  .displayName('身份证号码')
  .matches(/^\d{15}|\d{18}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.officeNumber)
  .displayName('办公号码')
  .matches(/^\d{3}-\d{8}|\d{4}-\d{7}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.home_number)
  .displayName('家庭电话')
  .matches(/^\d{3}-\d{8}|\d{4}-\d{7}$/).withMessage(`\${$displayName} 格式错误`)

  .ensure((e: Employee)  => e.position)
  .displayName('职位')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((e: Employee)  => e.address)
  .displayName('家庭住址')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)

  .ensure((e: Employee)  => e.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 长度不能超过500`)
  .rules;
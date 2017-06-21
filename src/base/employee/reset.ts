import {autoinject, inject, newInstance} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {customElement} from "aurelia-templating";
import {EmployeeService} from "../services/employee";
import {DialogController, DialogService} from "ui";
import { ValidationController , ValidationRules } from "aurelia-validation";
import { formValidationRenderer } from "../../validation/support";

export class EmployeePassword {
  id: string;
  password: string;
  the2password: string;
  checkedRoleIds: string[];

  constructor(@inject private employeeService: EmployeeService,
              @inject private dialogController: DialogController,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    this.id = params.id;
    this.validationController.addObject(this, validationRules);
  }

  async ok() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    if (this.password != this.the2password) {
      await this.dialogService.alert({title: "", message: '两次密码不一致，请重新输入！', icon: "error"});
      return;
    }
    try {
      await this.employeeService.resetPassword(this.id, this.password);
      await this.dialogService.alert({title: "", message: '修改成功'});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  cancel() {
    this.dialogController.cancel();
  }

}

const validationRules = ValidationRules
  .ensure('password')
  .displayName('密码')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure('the2password')
  .displayName('二次密码')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;
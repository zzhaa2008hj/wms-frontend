/**
 * Created by shun on 2017/6/16.
 */
import { inject, newInstance } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { EmployeeService } from "@app/base/services/employee";
import { Employee, validationRules } from '@app/base/models/employee';
import { OrganizationRole } from "@app/base/models/organization-role";
import { DialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

export class EmployeeAdd {

  organizationRoles: OrganizationRole[];
  employee = {} as Employee;
  disabled: boolean = false;

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  /**
   * 初始化
   */
  async activate() {
    this.employee.sex = '1';
    this.validationController.addObject(this.employee, validationRules);
  }

  /**
   * 保存
   */
  async doSave() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    this.disabled = true;
    try {
      await this.employeeService.saveEmployee(this.employee);
      await this.dialogService.alert({ title: "", message: "新增成功！" });
      this.goBack();
    } catch (err) {
      await this.dialogService.alert({ title: "", message: err.message, icon: "error" });
      this.disabled = false;
    }
  }

  /**
   * 返回列表页面
   */
  goBack() {
    this.router.navigateToRoute('list');
  }
}
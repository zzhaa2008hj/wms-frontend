import { inject, newInstance } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { EmployeeService } from "@app/base/services/employee";
import { Organization } from "@app/base/models/organization";
import { Employee, validationRules } from '@app/base/models/employee';
import { DialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

export class EmployeeEdit {

  id: string;
  organizations: Organization[];
  employee: Employee = {} as Employee;

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router,
              @inject private dialogService: DialogService,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate(params) {
    this.id = params.id;
    this.employee = await this.employeeService.getEmployee(this.id);
    this.validationController.addObject(this.employee, validationRules);
  }

  async doSave() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    try {
      await this.employeeService.updateEmployee(this.id, this.employee);
      await this.dialogService.alert({ title: "", message: "编辑成功！" });
      this.goBack();
    } catch (err) {
      await this.dialogService.alert({ title: "", message: err.message, icon: "error" });
    }
  }

  goBack() {
    this.router.navigateToRoute('list');
  }

}

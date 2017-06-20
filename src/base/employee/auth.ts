import { autoinject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { customElement } from "aurelia-templating";
import { EmployeeService } from "../services/employee";
import { DialogController, DialogService } from "ui";
import { Employee } from "../models/employee";
import { OrganizationRole } from "../models/organization-role";

@autoinject
@customElement('employee-auth')
export class EmployeeAuth {

  employee  = {} as Employee ;
  organizationRoles: OrganizationRole[];
  checkedRoleIds: string[];

  constructor(private employeeService: EmployeeService,
              private dialogController: DialogController) {
  }

  async activate(params) {
    this.employee = await this.employeeService.getEmployee(params.id);
    // 获取机构所有的角色列表
    this.organizationRoles = await this.employeeService.getOrganizationRoles();
    // 获取员工机构角色列表
    let employeeRoles = await this.employeeService.getEmployeeRoles(params.id);
    this.checkedRoleIds = employeeRoles.map(role => role.id);
  }

  async ok() {
    try {
      await this.employeeService.updateAuthorization(this.employee.id, this.checkedRoleIds);
      this.dialogController.ok();
    } catch (err) {
      this.dialogController.error(err);
    }
  }

  cancel() {
    this.dialogController.cancel();
  }

}
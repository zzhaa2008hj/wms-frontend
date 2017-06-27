import { EmployeeService } from "../services/employee";
import { Employee } from "../models/employee";
import { OrganizationRole } from "../models/organization-role";
import { inject } from "aurelia-dependency-injection";
import { DialogController } from "ui";

export class EmployeeAuth {

  employee  = {} as Employee ;
  organizationRoles: OrganizationRole[];
  checkedRoleIds: string[];

  constructor(@inject private employeeService: EmployeeService,
              @inject private dialogController: DialogController) {
  }

  async activate(params) {
    this.employee = await this.employeeService.getEmployee(params.id);
    // 获取机构所有的角色列表
    this.organizationRoles = await this.employeeService.getOrganizationRoles();
    // 获取员工机构角色列表
    let employeeRoles = await this.employeeService.getEmployeeRoles(params.id);
    if (!employeeRoles) return;
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
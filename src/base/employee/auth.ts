import { inject } from "aurelia-dependency-injection";
import { EmployeeService } from "@app/base/services/employee";
import { DialogController} from "ui";
import { Employee } from "@app/base/models/employee";
import { OrganizationRole } from "@app/base/models/organization-role";

export class EmployeeAuth {

  employee  = {} as Employee ;
  organizationRoles: OrganizationRole[] = [];
  checkedRoleIds: string[] = [];
  disabled: boolean = false;

  constructor(@inject private employeeService: EmployeeService,
              @inject private dialogController: DialogController) {
  }

  async activate(params) {
    this.employee = params;
    // 获取机构所有的角色列表
    this.organizationRoles = await this.employeeService.getOrganizationRoles();
    if (!this.organizationRoles || this.organizationRoles.length == 0) {
      return;
    }
    // 获取员工机构角色列表
    let employeeRoles = await this.employeeService.getEmployeeRoles(params.id);
    if (!employeeRoles || employeeRoles.length == 0) return;
    this.checkedRoleIds = employeeRoles.map(role => role.id);
  }

  async ok() {
    this.disabled = true;
    try {
      await this.employeeService.updateAuthorization(this.employee.id, this.checkedRoleIds);
      this.dialogController.ok();
    } catch (err) {
      this.dialogController.error(err);
      this.disabled = false;
    }
  }

  cancel() {
    this.dialogController.cancel();
  }

}
/**
 * Created by shun on 2017/6/16.
 */
import {inject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "@app/base/services/employee";
import {Employee} from "@app/base/models/employee";
import {OrganizationRole} from "@app/base/models/organization-role";
import {DialogService } from "ui";

export class EmployeeAdd {

  organizationRoles: OrganizationRole [];
  employee = {} as Employee;

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router,
              @inject private dialogService: DialogService) {
  }

  /**
   * 初始化
   */
  async activate() {
    this.employee.sex = '1';
  }

  /**
   * 保存
   */
  async doSave() {
    try {
      await this.employeeService.saveEmployee(this.employee);
      await this.dialogService.alert({title: "", message: "新增成功！"});
      this.goBack();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  /**
   * 返回列表页面
   */
  goBack() {
    this.router.navigateToRoute('list');
  }


}
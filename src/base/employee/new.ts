/**
 * Created by shun on 2017/6/16.
 */
import {autoinject, inject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {Employee} from "../models/employee";
import {OrganizationRole} from "../models/organization-role";
import { DialogController, DialogService } from "ui";

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
   * 保存/修改
   */
  async doSave() {
    try {
      await this.employeeService.saveEmployee(this.employee);
      await this.dialogService.alert({title: "", message: "编辑成功！"});
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
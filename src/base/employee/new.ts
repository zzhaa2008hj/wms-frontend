/**
 * Created by shun on 2017/6/16.
 */
import {autoinject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {Employee} from "../models/employee";
import {OrganizationRole} from "../models/organization-role";
import {MessageDialogService} from "ui";

@autoinject
export class EmployeeAdd {

  organizationRoles: OrganizationRole [];
  employee = {} as Employee;

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化
   * @returns {Promise<void>}
   */
  async activate() {
    this.employee.sex = '1';
  }

  /**
   * 保存/修改
   * @returns {Promise<void>}
   */
  async doSave() {
    try {
      await this.employeeService.saveEmployee(this.employee);
      await this.messageDialogService.alert({title: "", message: "编辑成功！"});
      this.goBack();
    } catch (err) {
      await this.messageDialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  goBack() {
    this.router.navigateToRoute('list');
  }


}
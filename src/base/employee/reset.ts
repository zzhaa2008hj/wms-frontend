import {autoinject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {customElement} from "aurelia-templating";
import {EmployeeService} from "../services/employee";
import {DialogController, DialogService} from "ui";

@autoinject
@customElement('employee-password')
export class EmployeePassword {
  id: string;
  password: string;
  the2password: string;
  checkedRoleIds: string[];

  constructor(private employeeService: EmployeeService,
              private dialogController: DialogController,
              private dialogService: DialogService) {
  }

  async activate(params) {
    this.id = params.id;
  }

  async ok() {
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
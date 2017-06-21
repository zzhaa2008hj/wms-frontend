import {autoinject, inject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {Organization} from "../models/organization";
import {Employee} from "../models/employee";
import {DialogService} from "ui";

export class EmployeeEdit {

  id: string;
  organizations: Organization [];
  employee: Employee;

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router,
              @inject private dialogService: DialogService) {
  }

  async activate(params) {
    this.id = params.id;
    this.employee = await this.employeeService.getEmployee(this.id);
  }

  async doSave() {
    try {
      await this.employeeService.updateEmployee(this.id, this.employee);
      await this.dialogService.alert({title: "", message: "编辑成功！"});
      this.goBack();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  goBack() {
    this.router.navigateToRoute('list');
  }

}
import {autoinject} from "aurelia-dependency-injection";
import {Router} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {Organization} from "../models/organization";
import {Employee} from "../models/employee";
import {MessageDialogService} from "ui";

@autoinject
export class EmployeeEdit {

  id: string;
  organizations: Organization [];
  employee: Employee;

  constructor(private employeeService: EmployeeService,
              private router: Router,
              private messageDialogService: MessageDialogService) {
  }

  async activate(params) {
    this.id = params.id;
    this.employee = await this.employeeService.getEmployee(this.id);
  }

  async doSave() {
    try {
      await this.employeeService.updateEmployee(this.id, this.employee);
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
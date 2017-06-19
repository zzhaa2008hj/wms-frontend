import { autoinject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { EmployeeService } from "../services/employee";
import { Employee } from "../models/employee";

@autoinject
export class EmployeeEdit {

  employee: Employee;

  constructor(private employeeService: EmployeeService,
              private router: Router) {
  }

  async activate(params) {
    this.employee = await this.employeeService.getEmployee(params.id);
  }

  goBack() {
    this.router.navigateToRoute('list');
  }

}
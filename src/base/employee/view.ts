import { autoinject, inject} from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { EmployeeService } from "../services/employee";
import { Employee } from "../models/employee";

export class EmployeeEdit {

  employee: Employee;

  constructor(@inject private employeeService: EmployeeService,
              @inject private router: Router) {
  }

  async activate(params) {
    this.employee = await this.employeeService.getEmployee(params.id);
  }

  goBack() {
    this.router.navigateToRoute('list');
  }

}
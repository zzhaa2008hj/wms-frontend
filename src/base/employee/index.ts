import {Router, RouterConfiguration} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {autoinject, Container} from "aurelia-dependency-injection";
import {Employee} from "../models/employee";

@autoinject
export class EmployeeList {

  router: Router;

  private employee = {} as Employee;

  constructor(private container: Container,
              private employeeService: EmployeeService) {
    this.container.registerInstance('employee', this.employee);
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.map([
      {route: '', name: 'list', moduleId: './list'},
      {route: '/new', name: 'new', moduleId: './new', title: "新增"},
      {route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑"}
    ]);
  }

}
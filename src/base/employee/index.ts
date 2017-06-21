import {Router, RouterConfiguration} from "aurelia-router";
import {EmployeeService} from "../services/employee";
import {autoinject, Container, inject} from "aurelia-dependency-injection";
import {Employee} from "../models/employee";

export class EmployeeList {

  router: Router;

  private employee = {} as Employee;

  constructor(@inject private container: Container,
              @inject private employeeService: EmployeeService) {
    this.container.registerInstance('employee', this.employee);
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.map([
      {route: '', name: 'list', moduleId: './list'},
      {route: '/new', name: 'new', moduleId: './new', title: "新增"},
      {route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑"},
      {route: '/:id/auth', name: 'auth', moduleId: './auth', title: "授权"},
      {route: '/:id/view', name: 'view', moduleId: './view', title: "查看"},
      {route: '/:id/reset-password', name: 'reset-password', moduleId: './reset', title: "重置密码"}
    ]);
  }

}
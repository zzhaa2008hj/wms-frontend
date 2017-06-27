import {Router, RouterConfiguration} from "aurelia-router";
import {Container, inject} from "aurelia-dependency-injection";
import {Employee} from "@app/base/models/employee";

export class EmployeeList {

  router: Router;

  private employee = {} as Employee;

  constructor(@inject private container: Container) {
    this.container.registerInstance('employee', this.employee);
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.map([
      {route: '', name: 'list', moduleId: './list'},
      {route: '/new', name: 'new', moduleId: './new', title: "新增"},
      {route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑"},
      {route: '/:id/auth', name: 'auth', moduleId: './auth', title: "授权"},
      {route: '/:id/view', name: 'view', moduleId: './view', title: "查看"}
    ]);
  }

}
import {Router, RouterConfiguration} from "aurelia-router";
import {autoinject, Container} from "aurelia-dependency-injection";

@autoinject
export class RoleList {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    this.router = router;
    config.map([
      {route: '', name: 'list', moduleId: './list'},
      {route: '/new', name: 'new', moduleId: './new', title: "新增"},
      {route: '/edit', name: 'edit', moduleId: './edit', title: "编辑"},
      {route: '/:id/auth', name: 'auth', moduleId: './auth', title: "授权菜单"}
    ]);
  }

}
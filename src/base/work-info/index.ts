import { Router, RouterConfiguration } from "aurelia-router";
export class WorkInfoRouter {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/edit', name: 'edit', moduleId: './edit', title: "编辑" },
    ]);
    this.router = router;

  }
}
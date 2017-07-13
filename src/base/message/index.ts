import { Router, RouterConfiguration } from "aurelia-router";
export class MessageRouter {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/detail', name: 'detail', moduleId: './detail', title: "详情" }
    ]);
    this.router = router;

  }
}
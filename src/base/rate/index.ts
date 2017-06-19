import { Router, RouterConfiguration } from "aurelia-router";
export class RateRouter {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/step', name: 'step', moduleId: './step/index', title: "阶梯费率设置" },
    ]);
    this.router = router;

  }
}
import { Router, RouterConfiguration } from "aurelia-router";
export class CargoFlow {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/details', name: 'details', moduleId: './details', title: "详情" },
      { route: '/separate/history', name: 'separateHistory', moduleId: './separate/index', title: "拆单历史" },
      { route: '/separate', name: 'separate', moduleId: './separate/new', title: "拆单" },
      { route: '/verify/:id', name: 'verify', moduleId: './verify/index', title: "库场审核" }
    ]);
    this.router = router;

  }
}
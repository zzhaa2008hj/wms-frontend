import { Router, RouterConfiguration } from "aurelia-router";
export class CargoFlow {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/details', name: 'details', moduleId: './details', title: "详情" },
      { route: '/:id/order', name: 'order', moduleId: './order', title: "入库指令单" },
      { route: '/:id/verify', name: 'verify', moduleId: './verify/index', title: "库场审核" },
      { route: '/:id/work-order', name: 'work-order', moduleId: './work-order/index', title: "新增作业" }
    ]);
    this.router = router;

  }
}
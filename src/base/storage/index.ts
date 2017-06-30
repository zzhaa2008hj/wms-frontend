import { Router, RouterConfiguration } from "aurelia-router";
export class StorageRouter {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/items', name: 'items', moduleId: './items/index', title: "明细" }
    ]);
    this.router = router;

  }
}
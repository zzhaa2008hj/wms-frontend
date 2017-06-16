import { Router, RouterConfiguration } from "aurelia-router";
export class DictionaryRouter {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/data', name: 'data', moduleId: './data/index', title: "字典数据" }
    ]);
    this.router = router;

  }
}
import { RouterConfiguration, Router } from "aurelia-router";

export class Order {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/detail', name: 'detail', moduleId: './detail', title: "详情" },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
      { route: '/item', name: 'orderItem', moduleId: './item/index', title: "出库单" },
      { route: '/:id/verify-work', name: 'verify-work', moduleId: './verify-work/index', title: '库场审核' },
      { route: '/:id/verify-business', name: 'verify-business', moduleId: './verify-business/index', title: '库场审核' },
      { route: '/:id/verify-deputy-general', name: 'verify-deputy-general', moduleId: './verify-deputy-general/index', title: '库场审核' }
    ]);
    this.router = router;
  }

}
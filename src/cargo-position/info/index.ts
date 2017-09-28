import { Router, RouterConfiguration } from "aurelia-router";

export class PositionTransferInfo {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增' },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: '修改' },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
      { route: '/:id/detail', name: 'detail', moduleId: './detail', title: '查看' }
    ]);
    this.router = router;
  }

}
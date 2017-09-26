import { Router, RouterConfiguration } from "aurelia-router";

export class PositionTransferInfo {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增' },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: '修改' },
      { route: '/:id/view', name: 'view', moduleId: './view', title: '查看' }
    ]);
    this.router = router;
  }

}
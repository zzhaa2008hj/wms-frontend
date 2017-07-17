import { Router, RouterConfiguration } from "aurelia-router";

export class WorkOrder {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/view', name: 'view', moduleId: './view', title: '查看' }
    ]);
    this.router = router;
  }
}
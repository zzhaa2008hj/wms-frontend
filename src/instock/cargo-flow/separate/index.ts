import { Router, RouterConfiguration } from "aurelia-router";
export class OperationLogs {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './history' },
      { route: '/:id/detail', name: 'separateDetail', moduleId: './detail', title: "拆单详情" }
    ]);
    this.router = router;
  }
}
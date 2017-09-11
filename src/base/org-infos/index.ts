import { Router, RouterConfiguration } from "aurelia-router";
export class OperationLogs {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'info', moduleId: './info' }
    ]);
    this.router = router;
  }
}
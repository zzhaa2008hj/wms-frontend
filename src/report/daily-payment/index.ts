import { Router, RouterConfiguration } from "aurelia-router";

export class Report {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
    ]);
    this.router = router;

  }
}
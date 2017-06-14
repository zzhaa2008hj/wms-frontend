import { Router, RouterConfiguration } from "aurelia-router";

export class Report {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'main', title: "报表主页", moduleId: './main' },
    ]);
    this.router = router;

  }
}
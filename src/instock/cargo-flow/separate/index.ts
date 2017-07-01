import { Router, RouterConfiguration } from "aurelia-router";
export class Separate {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'history', moduleId: './history' },
    ]);
    this.router = router;

  }
}
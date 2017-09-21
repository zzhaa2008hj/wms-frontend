import { RouterConfiguration, Router } from "aurelia-router";

export class ElectronicWarehouseIndex {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
    ]);
    this.router = router;
  }

}
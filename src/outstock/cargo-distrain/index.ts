import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class CargoFlow {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" }
    ]);
    this.router = router;

  }
}
import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Charge {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/customer-confirmation', name: 'customerConfirm', moduleId: './customer-confirmation/new' },
      { route: '/:id/note', name: 'note', moduleId: './note' },
    ]);
    this.router = router;
  }

}
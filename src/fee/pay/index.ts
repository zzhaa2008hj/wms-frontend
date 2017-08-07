import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Pay {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new' },
      { route: '/:id/details', name: 'details', moduleId: './details', title: '清单' }
      //{ route: '/:id/note', name: 'note', moduleId: './note' },
    ]);
    this.router = router;
  }

}
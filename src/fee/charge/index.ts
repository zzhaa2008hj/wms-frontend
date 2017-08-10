import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Charge {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/customer-confirmation', name: 'customerConfirm', moduleId: './customer-confirmation/new', title: '客户确认' },
      { route: '/:id/note', name: 'note', moduleId: './note' , title: '收费单'},
      { route: '/new', name: 'new', moduleId: './new' },
      { route: '/new-audit', name: 'new-audit', moduleId: './new-audit' },
      { route: '/:id/view', name: 'view', moduleId: './view' },
      { route: '/:id/edit', name: 'edit', moduleId: './edit' }
    ]);
    this.router = router;
  }

}
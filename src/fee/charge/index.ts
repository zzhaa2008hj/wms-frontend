import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Charge {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/confirm', name: 'confirm', moduleId: './confirm', title: '客户确认' },
      { route: '/:id/note', name: 'note', moduleId: './note' , title: '收费单'},
      { route: '/new', name: 'new', moduleId: './new' },
      { route: '/new-audit', name: 'new-audit', moduleId: './new-audit' },
      { route: '/:id/view', name: 'view', moduleId: './view' },
      { route: '/:id/edit', name: 'edit', moduleId: './edit' },
      { route: '/:id/edit-audit', name: 'edit-audit', moduleId: './edit-audit' },
      { route: '/:id/invoice', name: 'invoice', moduleId: './invoice/index', title: '查看发票' },
      { route: '/:id/verification', name: 'verification', moduleId: './verification/index', title: '发票核销' }
    ]);
    this.router = router;
  }

}
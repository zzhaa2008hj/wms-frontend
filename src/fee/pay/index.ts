import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Pay {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new' },
      { route: '/:id/details', name: 'details', moduleId: './details' },
      //{ route: '/:id/note', name: 'note', moduleId: './note' },
      { route: '/:id/confirm', name: "confirm", moduleId: './confirm', title: "客户确认" },
      { route: '/:id/verify', name: "verify", moduleId: './verify', title: "费收审核" },
      { route: '/:id/note', name: "note", moduleId: "./note", title: "生成付费单" }
    ]);
    this.router = router;
  }

}
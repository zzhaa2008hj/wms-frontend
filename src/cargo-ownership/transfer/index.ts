import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Transfer {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/audit/:id/:type', name: 'audit', moduleId: './audit/index', title: "审核" },
      { route: '/:id/view', name: 'view', moduleId: './view', title: "详情" },
    ]);
    this.router = router;
  }
}
import { RouterConfiguration, Router } from "aurelia-router";
import { autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Transfer {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/view', name: 'view', moduleId: './view', title: "详情" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "修改" },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
    ]);
    this.router = router;
  }
}
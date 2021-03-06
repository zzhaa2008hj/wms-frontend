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
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "修改" },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
      { route: '/btn-search', name: 'searchBtn', moduleId: './batch-search/index', title: "货权转移记录" },
    ]);
    this.router = router;
  }
}
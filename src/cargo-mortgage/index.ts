import { Router, RouterConfiguration } from "aurelia-router";

export class Report {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增'},
      { route: ':id/view', name: 'view', moduleId: './view', title: '查看'},
      { route: ':id/edit', name: 'edit', moduleId: './edit', title: '修改'},
      { route: ':id/unmortgaged', name: 'unmortgaged', moduleId: './unmortgaged', title: '解押'},
      { route: ':id/audit', name: 'audit', moduleId: './audit', title: '审核'},
      { route: ':id/approve', name: 'approve', moduleId: './approve', title: '审批'}
    ]);
    this.router = router;
  }
}
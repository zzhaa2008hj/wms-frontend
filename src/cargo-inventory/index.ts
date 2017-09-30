import { Router, RouterConfiguration } from "aurelia-router";

export class Report {

  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增'},
      { route: ':id/view', name: 'view', moduleId: './view', title: '查看'},
      { route: ':id/records', name: 'records', moduleId: './records', title: '盘点记录'}
    ]);
    this.router = router;
  }
}
import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject, Container } from "aurelia-dependency-injection";
import { RouterParams } from '@app/common/models/router-params';

@autoinject
export class WorkOrder {
  router: Router;
  routerParams = {} as RouterParams;

  constructor(private container: Container) {
    this.container.registerInstance('routerParams', this.routerParams);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: '新增作业' },
      { route: '/new-item/:id', name: 'new-item', moduleId: './new-item', title: '新增作业过程' },
      { route: '/new-area/:id', name: 'new-item', moduleId: './new-area', title: '新增作业区域'}
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = {} as RouterParams;
    res.businessId = params.id;
    res.type = params.type;
    Object.assign(this.routerParams, res);
  }
}
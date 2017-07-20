import { Router, RouterConfiguration } from "aurelia-router";
import { RouterParams } from '@app/common/models/router-params';
import { Container, autoinject } from 'aurelia-dependency-injection';

@autoinject
export class InstockOrderRouter {
  router: Router;
  routerParams = {} as RouterParams;

  constructor(private container: Container) {
    this.container.registerInstance('routerParams', this.routerParams);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/view', name: 'view', moduleId: './view', title: '查看' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = {} as RouterParams;
    res.infoId = params.infoId;
    Object.assign(this.routerParams, res);
  }
}
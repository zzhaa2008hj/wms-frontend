import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject } from 'aurelia-framework';
import { RouterParams } from '@app/common/models/router-params';
import { Container } from 'aurelia-dependency-injection';

@autoinject
export class OrderItemRouter {
  router: Router;
  routerParams = {} as RouterParams;

  constructor(private container: Container) {
    this.container.registerInstance('routerParams', this.routerParams);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: "", name: "list", moduleId: "./list" },
      { route: "/:id/detail", name: "detail", moduleId: "./detail", title: "详情" }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = {} as RouterParams;
    res.infoId = params.infoId;
    Object.assign(this.routerParams, res);
  }
}
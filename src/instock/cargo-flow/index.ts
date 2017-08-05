import { Router, RouterConfiguration } from "aurelia-router";
import { RouterParams } from '@app/common/models/router-params';
import { Container, autoinject } from 'aurelia-dependency-injection';

@autoinject
export class CargoFlow {

  router: Router;
  routerParams = {} as RouterParams;

  constructor(private container: Container) {
    this.container.registerInstance('routerParams', this.routerParams);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/details', name: 'details', moduleId: './details', title: "详情" },
      { route: '/order/:id', name: 'order', moduleId: './order', title: "入库指令单" },
      { route: '/separate/:id/histories', name: 'separateHistory', moduleId: './separate/index', title: "拆单历史" },
      { route: '/separate/:id/new', name: 'separate', moduleId: './separate/new', title: "拆单" },
      { route: '/verify/:id', name: 'verify', moduleId: './verify/index', title: "库场审核" },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
      { route: '/work-order/:id/:type', name: 'work-order', moduleId: '/dist/base/work-order/index', title: "作业列表" },
      { route: '/:id/verify-business', name: 'verify-business', moduleId: './verify-business/index', title: "商务审核" }
    ]);
    this.router = router;

  }

  async activate(params) {
    let res = {} as RouterParams;
    res.infoId = params.infoId;
    Object.assign(this.routerParams, res);
  }
}
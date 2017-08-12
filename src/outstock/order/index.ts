import { RouterConfiguration, Router } from "aurelia-router";
import { RouterParams } from '@app/common/models/router-params';
import { Container, autoinject } from 'aurelia-dependency-injection';

@autoinject
export class Order {

  router: Router;
  routerParams = {} as RouterParams;

  constructor(private container: Container) {
    this.container.registerInstance('routerParams', this.routerParams);
  }

  configureRouter(config: RouterConfiguration, router: Router) {

    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/new', name: 'new', moduleId: './new', title: "新增" },
      { route: '/additional-recording', name: 'additional-recording', moduleId: './additional-recording', title: "补录" },
      { route: '/:id/edit', name: 'edit', moduleId: './edit', title: "编辑" },
      { route: '/:id/detail', name: 'detail', moduleId: './detail', title: "详情" },
      { route: '/order-work/:id', name: 'order-work', moduleId: './order', title: "出库作业指令单" },
      { route: '/:id/change-historys', name: 'changeHistory', moduleId: './change-history/index', title: "修改记录" },
      { route: '/:id/verify-work', name: 'verify-work', moduleId: './verify-work/index', title: '库场审核' },
      { route: '/:id/verify-business', name: 'verify-business', moduleId: './verify-business/index', title: '商务审核' },
      { route: '/:id/verify-deputy-general', name: 'verify-deputy-general', moduleId: './verify-deputy-general/index',
        title: '副总审核' },
      { route: '/work-order/:id/:type', name: 'work-order', moduleId: '/dist/base/work-order/index', title: "作业列表" },
      { route: '/:id/confirm-business', name: 'confirm-business', moduleId: './confirm-business/index', title: '商务确认' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = {} as RouterParams;
    res.infoId = params.infoId;
    Object.assign(this.routerParams, res);
  }
}
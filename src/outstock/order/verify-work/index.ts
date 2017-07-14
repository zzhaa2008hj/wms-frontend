import { Router, RouterConfiguration } from "aurelia-router";
import { autoinject, Container } from "aurelia-dependency-injection";
import {Order} from "@app/outstock/models/order";
import { OrderService} from "@app/outstock/services/order";
@autoinject
export class VerifyFlow {
  router: Router;
  order = {} as Order;

  constructor(private orderService: OrderService,
              private container: Container) {
    this.container.registerInstance('outstockOrder', this.order);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'list', moduleId: './list' },
      { route: '/:id/view', name: 'view', moduleId: './view', title: '详情' }
    ]);
    this.router = router;
  }

  async activate(params) {
    let res = await this.orderService.getOrderById(params.id);
    Object.assign(this.order, res);
  }
}
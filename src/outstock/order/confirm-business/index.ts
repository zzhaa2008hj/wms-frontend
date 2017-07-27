import { Router, RouterConfiguration } from "aurelia-router";
import { inject, Container } from "aurelia-dependency-injection";
import { Order } from "@app/outstock/models/order";

export class ConfirmBusiness {
  router: Router;
  order = {} as Order;

  constructor(@inject private container: Container) {
    this.container.registerInstance('outstockOrderId', this.order);
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      { route: '', name: 'edit', moduleId: './edit' },
    ]);
    this.router = router;
  }

  async activate({id}) {
    this.order.id = id;
  }
}
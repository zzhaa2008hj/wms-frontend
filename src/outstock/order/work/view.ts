import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { Order, OutstockOrderVo, Vehicle } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
@autoinject
export class WorkView {
  orderVo: OutstockOrderVo;
  datasource: kendo.data.DataSource;
  order: Order;
  vehicles = [] as Vehicle[];
  constructor(private router: Router,
              private orderService: OrderService) {
  }

  /**
   * 路由跳转执行
   */
  async activate({ id }) {
    this.orderVo = await this.orderService.getOutstockOrderView(id);
    this.order = await this.orderService.getOrderById(id);
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.order.outstockOrderItems);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
    this.vehicles = this.order.outstockVehicles;
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

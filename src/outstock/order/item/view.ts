import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { OutstockOrderVo } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
@autoinject
export class OrderView {
  orderVo: OutstockOrderVo;
  datasource: kendo.data.DataSource;

  constructor(private router: Router,
              private orderService: OrderService) {
  }

  /**
   * 路由跳转执行
   */
  async activate({ id }) {
    this.orderVo = await this.orderService.getOutstockOrderView(id);
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.orderVo.outstockOrderItems);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

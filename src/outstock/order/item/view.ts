import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { Order } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
@autoinject
export class OrderView {
  units = [] as DictionaryData[];
  order = {} as Order;
  datasource: kendo.data.DataSource;

  constructor(private router: Router,
              private dictionaryDataService: DictionaryDataService,
              private orderService: OrderService) {
  }

  /**
   * 路由跳转执行
   */
  async activate({ id }) {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.order = await this.orderService.getOutstockOrderView(id);

    if (this.order.unitStr) this.order.unitStr = this.units.find(r => r.dictDataCode == this.order.unit).dictDataName;
    this.order.outstockOrderItems.map(res => {
      res.unitStr = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
      return res;
    });

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
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

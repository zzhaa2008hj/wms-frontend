import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { Order } from "@app/outstock/models/order";
import { OrderService } from "@app/outstock/services/order";
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { addHeader,print } from "@app/common/services/print-tool";
@autoinject
export class OrderView {
  units = [] as DictionaryData[];
  order = {} as Order;

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
      Object.assign(res, { index: this.order.outstockOrderItems.indexOf(res) + 1 });
      return res;
    });
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

  /**
   * 打印出库单
   */
  printOutStockItem(){
    let title = "付费单";
    let strHTML = $("#outStockItem").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true);
  }
}

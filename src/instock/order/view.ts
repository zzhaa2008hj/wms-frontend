import { Router } from "aurelia-router";
import { inject } from "aurelia-dependency-injection";
import { InstockOrderVo } from "@app/instock/models/instock-order";
import { InstockOrderService } from "@app/instock/services/instock-order";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class InstockOrderView {
  instockOrderVo: InstockOrderVo;
  datasource: kendo.data.DataSource;
  units = [] as DictionaryData[];

  constructor( @inject private router: Router,
    @inject private instockOrderService: InstockOrderService,
    @inject private dictionaryDataService: DictionaryDataService) {
  }

  /**
   * 路由跳转执行
   */
  async activate({ id }) {
    // 单位
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");

    this.instockOrderVo = await this.instockOrderService.getInstockOrder(id);
    this.instockOrderVo.orderItems.map(res => {
      let unit = this.units.find(d => res.unit == d.dictDataCode);
      if (unit) {
        // 只是查看
        res.unit = unit.dictDataName;
      }
    });
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.instockOrderVo.orderItems);
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

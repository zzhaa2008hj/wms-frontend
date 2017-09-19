import { DataSourceFactory } from "@app/utils";
import { autoinject } from "aurelia-dependency-injection";
import { OrderService } from "@app/outstock/services/order";
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
@autoinject
export class OrderItemList {
  keywords: string;
  dataSource: kendo.data.DataSource;
  units: DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private orderService: OrderService,
              private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orderService.queryOrdersByOrderType(1, this.keywords).map(res => {
        let dict = this.units.find(r => r.dictDataCode == res.unit);
        if (dict) {
          res.unitStr = dict.dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
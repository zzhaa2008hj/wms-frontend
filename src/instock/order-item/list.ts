import { inject } from 'aurelia-dependency-injection';
import { OrderItemService } from "@app/instock/services/order-item";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { RouterParams } from '@app/common/models/router-params';

export class OrderItemList {
  batchNumber: string;
  dataSource: kendo.data.DataSource;
  units = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private orderItemService: OrderItemService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    if (this.routerParams.infoId) {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.orderItemService
          .queryOrderItems({ infoId: this.routerParams.infoId, batchNumber: this.batchNumber })
          .map(res => {
            if (res.unit) {
              res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
            }
            return res;
          }),
        pageSize: 10
      });
    } else {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.orderItemService.queryOrderItems({ batchNumber: this.batchNumber }).map(res => {
          if (res.unit) {
            res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
          }
          return res;
        }),
        pageSize: 10
      });
    }
  }

  select() {
    this.dataSource.read();
  }
}
import { inject } from "aurelia-dependency-injection";
import { InstockOrderService } from "@app/instock/services/instock-order";
import { DataSourceFactory } from "@app/utils";
import { RouterParams } from '@app/common/models/router-params';
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DictionaryData } from "@app/base/models/dictionary";

export class InstockOrderList {
  units = [] as DictionaryData[];
  keywords: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private instockOrderService: InstockOrderService,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private dataSourceFactory: DataSourceFactory) {

  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    if (this.routerParams.infoId) {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.instockOrderService
          .queryInstockOrders({ infoId: this.routerParams.infoId, keywords: this.keywords })
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
        query: () => this.instockOrderService.queryInstockOrders({ keywords: this.keywords })
          .map(res => {
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
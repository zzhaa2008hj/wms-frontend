/**
 * Created by shun on 2017/7/1.
 */
import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { CustomhouseClearanceService } from "@app/base/services/customhouse";

export class CustomhouseList {
  search: { 
    category: '',
    customhouseFlowNumber: '';
    customhouseRecordNumber: '';
  };

  types = [{id: 1, name: '入库'}, {id: 2, name: '出库'}];
  clearanceStatus = [ {id: '1', name: '未放行'}, {id: '2', name: '已放行'}];

  dataSource: kendo.data.DataSource;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private customhouseService: CustomhouseClearanceService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.customhouseService.queryCustomhouseClearancePage(this.search)
      .map(c => {
        c.categoryName = this.types.find(t => t.id == c.category).name;
        c.clearanceStatusName = this.clearanceStatus.find(t => t.id == c.clearanceStatus).name;
        return c;
      }),
      pageSize: 10
    });
  }

  find() {
    this.dataSource.read();
  }
}
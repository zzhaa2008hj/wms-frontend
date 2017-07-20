import { inject } from "aurelia-dependency-injection";
import { InstockOrderService } from "@app/instock/services/instock-order";
import { DataSourceFactory } from "@app/utils";
import { RouterParams } from '@app/common/models/router-params';

export class InstockOrderList {
  keywords: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private instockOrderService: InstockOrderService,
              @inject('routerParams') private routerParams: RouterParams,
              @inject private dataSourceFactory: DataSourceFactory) {
    
  }

  activate() {
    if (this.routerParams.infoId) {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.instockOrderService
          .queryInstockOrders({infoId: this.routerParams.infoId, keywords: this.keywords}),
        pageSize: 10
      });
    } else {
      this.dataSource = this.dataSourceFactory.create({
        query: () => this.instockOrderService.queryInstockOrders({keywords: this.keywords}),
        pageSize: 10
      });
    }
  }

  select() {
    this.dataSource.read();
  }
}
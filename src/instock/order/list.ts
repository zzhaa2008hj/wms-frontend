import { inject } from "aurelia-dependency-injection";
import { InstockOrderService } from "@app/instock/services/instock-order";
import { DataSourceFactory } from "@app/utils";

export class InstockOrderList {
  keywords: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private instockOrderService: InstockOrderService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.instockOrderService.queryInstockOrders(this.keywords),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
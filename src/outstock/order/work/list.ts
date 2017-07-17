import { DataSourceFactory } from "@app/utils";
import { autoinject } from "aurelia-dependency-injection";
import { OrderService } from "@app/outstock/services/order";
@autoinject
export class WorkOrderList {
  keywords: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private orderService: OrderService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.orderService.queryOrdersByOrderType(2, this.keywords),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
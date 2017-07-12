import { autoinject } from "aurelia-dependency-injection";
import { OutstockInventoryService } from "@app/outstock/services/inventory";
import { DataSourceFactory } from "@app/utils";

@autoinject
export class OutstockInventoryList {
  batchNumber: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private outstockInventoryService: OutstockInventoryService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.outstockInventoryService.queryOutstockInventorys(this.batchNumber),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
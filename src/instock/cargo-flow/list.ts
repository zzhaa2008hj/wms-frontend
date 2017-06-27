import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { DataSourceFactory } from "@app/utils";
@autoinject
export class CargoFlow {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(private cargoFlowService: CargoFlowService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoFlowService.queryCargoFlows({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

}
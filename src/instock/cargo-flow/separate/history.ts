import { autoinject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { CargoFlowSeparateService } from "@app/instock/services/cargo-flow-seperate";
@autoinject
export class SeparateHistory {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(private cargoFlowSeparateService: CargoFlowSeparateService,
              private dataSourceFactory: DataSourceFactory) {
    
  }

  activate(params) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoFlowSeparateService
        .queryCargoFlowSeparates({ flowId: params.id, keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

}
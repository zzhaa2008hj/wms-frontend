import { autoinject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import { CargoFlowSeparateService } from "@app/instock/services/cargo-flow-seperate";
import { Router } from "aurelia-router";
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
              private router: Router,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoFlowSeparateService.queryCargoFlowSeparates({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  goDetail(cargoFlowSeparate) {
    this.router.navigateToRoute("separateDetail", "", { cargoFlowSeparate: cargoFlowSeparate });
  }
}
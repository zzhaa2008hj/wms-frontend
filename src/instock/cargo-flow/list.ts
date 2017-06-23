import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "../../utils";
import { CargoFlowService } from "../services/cargo-flow";
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
              private dataSourceFactory: DataSourceFactory,
              private messageDialogService: MessageDialogService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoFlowService.queryCargoFlows({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

}
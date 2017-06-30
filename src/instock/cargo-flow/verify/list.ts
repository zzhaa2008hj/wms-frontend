import { inject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { DataSourceFactory } from "@app/utils";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { WorkStatisticsService } from "@app/instock/services/work-statistics";
import { WorkStatistics } from "@app/instock/models/work";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { Router } from "aurelia-router";
import { DialogService } from "ui";
import { ViewWorkOrder } from "@app/instock/cargo-flow/verify/view";


export class VerifyWarehouse {
  datasource: kendo.data.DataSource;
  workStatistics = {} as WorkStatistics;

  constructor(@inject private cargoItemService: CargoItemService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private cargoFlowService: CargoFlowService,
              @inject private workStatisticsService: WorkStatisticsService,
              @inject private dialogService: DialogService,
              @inject private router: Router,
              @inject("cargoFlow") private cargoFlow: CargoFlow) {
    this.datasource = this.dataSourceFactory.create({
      query: () => this.cargoItemService.queryCargoItems({ flowId: this.cargoFlow.id }),
      pageSize: 10
    });
  }

  async activate() {
    this.workStatistics = await this.workStatisticsService.getStatistics(this.cargoFlow.id);
    this.workStatistics.batchNumber = this.cargoFlow.batchNumber;
    this.workStatistics.unit = this.cargoFlow.unit;
    this.workStatistics.workOrderCategory = this.cargoFlow.status;
    this.workStatistics.businessId = this.cargoFlow.id;
  }

  async  check(params) {
    if (params == 1) {
      await this.workStatisticsService.saveStatistics(this.workStatistics);
    }
    await this.cargoFlowService.audit(this.cargoFlow.id, params);
    this.router.navigateBack();
  }

  async  view(id: string) {
    await this.dialogService.open({ viewModel: ViewWorkOrder, model: { id: id }, lock: true });
  }
}
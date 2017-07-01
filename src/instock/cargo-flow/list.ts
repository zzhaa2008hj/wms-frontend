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

  formatStage(stage: number) {
    return ['初始阶段',
      '待商务审核',
      '商务审核未通过',
      '商务审核通过',
      '已生成入库指令单',
      '入库作业中',
      '作业完成（待审核）',
      '库场审核未通过',
      '已生成理货报告',
      '已生成入库单',
      '入库完成'][stage];
  }
}
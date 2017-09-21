import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import { DictionaryData } from "@app/base/models/dictionary";
import { StatisticsCriteria, PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";

@autoinject
export class PositionTransferInfoList {

  criteria: StatisticsCriteria = {};
  dataSource: kendo.data.DataSource;
  units: DictionaryData[] = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private positionTransferInfoService: PositionTransferInfoService,
              private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.positionTransferInfoService.page(this.criteria),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  reset() {
    this.criteria = {};
    this.dataSource.read();
  }

}
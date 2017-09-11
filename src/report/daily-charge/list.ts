import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import { DictionaryData } from "@app/base/models/dictionary";
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";
import { DailyChargeService } from "@app/report/services/daily-charge";

@autoinject
export class DailyChargeList {

  criteria: FeeStatisticsCriteria = {};
  dataSource: kendo.data.DataSource;
  units: DictionaryData[] = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private dailyChargeService: DailyChargeService,
              private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.dailyChargeService.page(this.criteria),
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
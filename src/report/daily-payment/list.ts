import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import { DictionaryData } from "@app/base/models/dictionary";
import { DictionaryDataService } from "@app/base/services/dictionary";
import { DailyPaymentService } from "@app/report/services/daily-payment";
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";

@autoinject
export class DailyPaymentList {

  criteria: FeeStatisticsCriteria = {};
  dataSource: kendo.data.DataSource;
  units: DictionaryData[] = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private dailyPaymentService: DailyPaymentService,
              private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory) {

  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.dailyPaymentService.page(this.criteria).map(res => {
        res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
        return res;
      }),
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
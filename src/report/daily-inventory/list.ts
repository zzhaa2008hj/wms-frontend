import { autoinject } from 'aurelia-dependency-injection';
import { Criteria, DailyInventoryService } from '@app/report/services/daily-inventory';
import { DataSourceFactory } from '@app/utils';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import * as moment from 'moment';

@autoinject
export class DailyInventoryList {

  criteria: Criteria = {};
  dataSource: kendo.data.DataSource;
  units: DictionaryData[] = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private dailyInventoryService: DailyInventoryService,
              private dictionaryDataService: DictionaryDataService,
              private dataSourceFactory: DataSourceFactory) {
    
  }

  async activate() {
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.criteria.makeDate = moment(new Date()).format("YYYY-MM-DD");
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.dailyInventoryService.page(this.criteria).map(res => {
        res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    if (this.criteria.makeDate) {
      this.criteria.makeDate = this.criteria.makeDate ? moment(this.criteria.makeDate).format("YYYY-MM-DD") : '';
    }
    this.dataSource.read();
  }

  reset() {
    this.criteria = {};
    this.criteria.makeDate = moment(new Date()).format("YYYY-MM-DD");
    this.dataSource.read();
  }
}
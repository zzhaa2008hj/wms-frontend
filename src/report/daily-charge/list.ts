import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import * as moment from 'moment';
import { DailyChargeService } from "@app/report/services/daily-charge";
import { ChargePaymentCriteria } from "@app/report/models/charge-payment-criteria";

@autoinject
export class DailyChargeList {

  criteria: ChargePaymentCriteria = {};
  dataSource: kendo.data.DataSource;

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
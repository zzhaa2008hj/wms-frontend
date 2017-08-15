import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import * as moment from 'moment';
import { MonthlyPaymentService } from "@app/report/services/monthly-payment";
import { ChargePaymentCriteria } from "@app/report/models/charge-payment-criteria";

@autoinject
export class MonthlyPaymentList {

  criteria: ChargePaymentCriteria = {};
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private monthlyPaymentService: MonthlyPaymentService,
              private dataSourceFactory: DataSourceFactory) {

  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.monthlyPaymentService.page(this.criteria),
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
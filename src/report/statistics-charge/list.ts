import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
// import * as moment from 'moment';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";
import { StatisticsChargeService } from "@app/report/services/statistics-charge";
// import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoInfoService } from "@app/base/services/cargo-info";
// import { CargoCategoryService } from "@app/base/services/cargo-category";
// import DataSource = kendo.data.DataSource;

@autoinject
export class StatisticsChargeList {
  criteria: FeeStatisticsCriteria = {};
  dataSource: kendo.data.DataSource;
  yearStatistic: Date;
  monthStatistic: Date;
  customers = [];
  cargoCategories;
  cargoCategoryTree = [];
  type: number;

  billingType = [{ text: "已开票", value: 1 }, { text: "未开票", value: 0 }];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private statisticsChargeService: StatisticsChargeService,
              private cargoInfoService: CargoInfoService,
              // private cargoCategoryService: CargoCategoryService,
              private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.statisticsChargeService.page(this.criteria),
      pageSize: 12
    });

    console.log(this.dataSource.data());
    let cargoInfos = await this.cargoInfoService.listBaseCargoInfos();
    let s = new Set();
    cargoInfos.forEach(ci => s.add(ci.customerName));
    for (let item of s.values()) {
      this.customers.push({ value: item });
    }

    this.type = 1;
  }

  select() {
    let yearMonth = '';
    if (this.yearStatistic) {
      let year = this.yearStatistic.getFullYear();
      yearMonth += year.toString();
      this.type = 3;
    }
    if (this.monthStatistic) {
      let month = this.monthStatistic.getMonth() + 1;
      let date = new Date;
      if (month < 10) {
        if (yearMonth == '') {
          yearMonth += date.getFullYear() + "-0" + month;
        } else {
          yearMonth += "-0" + month;
        }
      } else {
        if (yearMonth == '') {
          yearMonth += date.getFullYear() + "-" + month;
        } else {
          yearMonth += "-" + month;
        }
      }
      this.type = 2;
    }
    this.criteria.yearMonth = yearMonth;
    if (yearMonth == '') {
      this.type = 1;
    }
    this.dataSource.read();
  }

  reset() {
    this.type = 1;
    this.criteria = {};
    this.dataSource.read();
  }

}
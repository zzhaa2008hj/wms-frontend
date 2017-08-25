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

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  dateType = [{ text: "本周", value: 1 }, { text: "本月", value: 2 }, { text: "本年", value: 3 }, { text: "全部", value: 4 }];
  billingType = [{ text: "已开票", value: 1 }, { text: "未开票", value: 2 }];
  customers = [];
  cargoCategories;
  cargoCategoryTree = [];

  constructor(private statisticsChargeService: StatisticsChargeService,
              private cargoInfoService: CargoInfoService,
              // private cargoCategoryService: CargoCategoryService,
              private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.statisticsChargeService.page(this.criteria),
      pageSize: 10
    });

    let cargoInfos = await this.cargoInfoService.listBaseCargoInfos();
    let s = new Set();
    cargoInfos.forEach(ci => s.add(ci.customerName));
    for (let item of s.values()) {
      this.customers.push({ value: item });
    }
    console.log(this.customers);


  }

  select() {
   let yearMonth = '';
    if (this.yearStatistic) {
      let year = this.yearStatistic.getFullYear();
       yearMonth += year.toString();
    }
    if (this.monthStatistic) {
      let month = this.monthStatistic.getMonth() + 1;
      yearMonth += "-" + month;
    }
    this.criteria.yearMonth = yearMonth;

    this.dataSource.read();
  }

  reset() {
    this.criteria = {};
    this.dataSource.read();
  }

}
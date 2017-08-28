import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import * as moment from 'moment';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";
import { StatisticsChargeService } from "@app/report/services/statistics-charge";
// import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { StatisticsCharge } from "@app/report/models/statistics-charge";
import { addHeader, print } from "@app/common/services/print-tool";
// import { CargoCategoryService } from "@app/base/services/cargo-category";
// import DataSource = kendo.data.DataSource;

@autoinject
export class StatisticsChargeList {
  otherStatistics: StatisticsCharge[];
  loadingStatistics: StatisticsCharge[];
  warehouseStatistics: StatisticsCharge[];
  statisticalDetails = [] as StatisticsCharge[];
  termStatistics: StatisticsCharge;
  monthlyStatistics: StatisticsCharge;
  statisticsCharges: StatisticsCharge[];
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
    this.setTable();

    this.dataSource = this.dataSourceFactory.create({
      query: () => this.statisticsChargeService.page(this.criteria),
      pageSize: 12
    });

    let cargoInfos = await this.cargoInfoService.listBaseCargoInfos();
    let s = new Set();
    cargoInfos.forEach(ci => s.add(ci.customerName));
    for (let item of s.values()) {
      this.customers.push({ value: item });
    }

    this.type = 1;
  }

  print() {
    let title;
    let strHTML;
    let orient = 0;
    if (this.type == 1) {
      title = "本周收费统计";
      strHTML = $("#week").html();
    }
    if (this.type == 2) {
      title = this.criteria.yearMonth + "收费统计";
      strHTML = $("#month").html();
    }
    if (this.type == 3) {
      title = this.criteria.yearMonth + "收费统计";
      strHTML = $("#year").html();
      orient = 2;
    }
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, orient);
  }

  async setTable() {
    this.statisticsCharges = await this.statisticsChargeService.getList(this.criteria);

    this.statisticsCharges.forEach(sc => {
      if (sc.date) {
        sc.dateStr = moment(sc.date).format("YYYY-MM-DD");
      }
      if (sc.billingType != null) {
        sc.billingTypeStr = sc.billingType == 1 ? "已开票" : "未开票";
      }
    });

    //年统计
    this.termStatistics = this.statisticsCharges.find(sc => sc.type == 3);
    if (this.termStatistics) {
      this.statisticalDetails = this.statisticsCharges.filter(sc => sc.type != 3);
    } else {
      //月统计
      this.monthlyStatistics = this.statisticsCharges.find(sc => sc.type == 2);
      if (this.monthlyStatistics) {
        this.statisticalDetails = this.statisticsCharges.filter(sc => sc.type != 2);
      }
      this.warehouseStatistics = this.statisticsCharges.filter(sc => sc.warehousingAmount > 0);
      this.loadingStatistics = this.statisticsCharges.filter(sc => sc.loadingAmount > 0);
      this.otherStatistics = this.statisticsCharges.filter(sc => sc.otherAmount > 0);

    }
  }

  select() {
    let yearMonth = "";
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
    this.setTable();
  }

  reset() {
    this.type = 1;
    this.criteria = {};
    this.dataSource.read();
  }

}
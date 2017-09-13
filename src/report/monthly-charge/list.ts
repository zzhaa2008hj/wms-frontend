import { autoinject } from 'aurelia-dependency-injection';
import { DataSourceFactory } from '@app/utils';
import * as moment from 'moment';
import { FeeStatisticsCriteria } from "@app/report/models/fee-statistics-criteria";
import { addHeader, print } from "@app/common/services/print-tool";
import { MonthlyChargeService } from "@app/report/services/monthly-charge";
import { MonthlyCharge } from "@app/report/models/monthly-charge";

@autoinject
export class MonthlyChargeList {
  total = {} as MonthlyCharge;
  monthlyCharges: MonthlyCharge[];
  maxDate;
  search = {
    searchDate: ''
  };
  searchDatePicker: any;
  criteria: FeeStatisticsCriteria = {};
  dataSource: kendo.data.DataSource;

  billingType = [{ text: "已开票", value: 1 }, { text: "未开票", value: 0 }];
  types = [{ text: "按客户统计", value: 1 },
    { text: "按货类统计", value: 2 },
    { text: "按开票状态统计", value: 4 },
    { text: "总计", value: 3 }];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private monthlyChargeService: MonthlyChargeService,
              private dataSourceFactory: DataSourceFactory) {
  }

  async activate() {
    this.getMaxDate();
    this.search.searchDate = moment(this.maxDate).format("YYYY-MM-DD");
    this.criteria.yearMonth = moment(this.maxDate).format("YYYY-MM");
    this.criteria.type = 1;

    this.dataSource = this.dataSourceFactory.create({
      query: () => this.monthlyChargeService.page(this.criteria),
      pageSize: 12
    });

    this.setTable();
  }

  onChanged() {
    this.setTable();
  }

  getMaxDate() {
    let year1 = new Date().getFullYear();
    let month1: number = new Date().getMonth();
    let year2;
    let month2;
    if (month1 == 1) {
      month2 = 12;
      year2 = year1 - 1;
    } else {
      month2 = month1 - 1;
      year2 = year1;
    }

    this.maxDate = new Date(year2, month2, 1);
  }

  endChange() {
    let endDate = new Date();
    endDate.setDate(endDate.getDate());
    this.searchDatePicker.max(endDate);
  }

  print() {
    let title;
    let strHTML;
    title = "收费统计";
    strHTML = $("#monthlyCharge").html();
    strHTML = addHeader(strHTML);
    print(title, strHTML, true, 2);
  }

  async setTable() {
    this.total.warehousingAmount = 0;
    this.total.loadingAmount = 0;
    this.total.otherAmount = 0;
    this.total.sumAmount = 0;
    this.total.monthCharge = 0;
    this.total.monthArrears = 0;
    this.total.grandTotalCharge = 0;
    this.total.grandTotalArrears = 0;
    this.total.grandTotalAmount = 0;
    console.log(this.criteria);
    this.monthlyCharges = await this.monthlyChargeService.getList(this.criteria);
    if (this.monthlyCharges.length > 0) {
      this.monthlyCharges.forEach(mc => {
        mc.invoiceStateStr = mc.invoiceState === 1 ? "已开票" : "未开票";
        this.total.warehousingAmount += mc.warehousingAmount;
        this.total.loadingAmount += mc.loadingAmount;
        this.total.otherAmount += mc.otherAmount;
        this.total.sumAmount += mc.sumAmount;
        this.total.monthCharge += mc.monthCharge;
        this.total.monthArrears += mc.monthArrears;
        this.total.grandTotalCharge += mc.grandTotalCharge;
        this.total.grandTotalArrears += mc.grandTotalArrears;
        this.total.grandTotalAmount += mc.grandTotalAmount;
      });
    }

  }

  select() {
    this.criteria.yearMonth = this.search.searchDate ? moment(this.search.searchDate).format("YYYY-MM") : '';
    this.dataSource.read();
  }

  reset() {
    this.criteria = {};
    this.dataSource.read();
  }

}
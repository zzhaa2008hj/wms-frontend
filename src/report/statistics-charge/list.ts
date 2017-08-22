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
  // tree = [{
  //   "text": "\u90e8\u95e8",
  //   "expanded": true,
  //   "id": 0,
  //   "items": [
  //     {
  //       "text": "\u8fd0\u8425\u90e8",
  //       "expanded": true,
  //       "pid": 0,
  //       "comments": "20140821-1",
  //       "items": [
  //         {
  //           "text": "\u4ea7\u54c1\u7ec4",
  //           "expanded": true,
  //           "pid": 1,
  //           "comments": "20140821-7",
  //           "items": [],
  //           "id": 7
  //         }
  //       ],
  //       "id": 1
  //     },
  //     {
  //       "text": "\u8d22\u52a1\u90e8",
  //       "expanded": true,
  //       "pid": 0,
  //       "comments": "20140821-2",
  //       "items": [],
  //       "id": 2
  //     },
  //     {
  //       "text": "\u884c\u653f\u90e8",
  //       "expanded": true,
  //       "pid": 0,
  //       "comments": "20140821-3",
  //       "items": [],
  //       "id": 3
  //     },
  //     {
  //       "text": "\u7814\u53d1\u90e8",
  //       "expanded": true,
  //       "pid": 0,
  //       "comments": "20140821-4",
  //       "items": [
  //         {
  //           "text": "\u5f00\u53d1\u7ec4",
  //           "expanded": true,
  //           "pid": 4,
  //           "comments": "20140821-8",
  //           "items": [],
  //           "id": 8
  //         },
  //         {
  //           "text": "\u6d4b\u8bd5\u7ec4",
  //           "expanded": true,
  //           "pid": 4,
  //           "comments": "20140821-9",
  //           "items": [],
  //           "id": 9
  //         }
  //       ],
  //       "id": 4
  //     },
  //     {
  //       "text": "\u8fd0\u7ef4\u90e8",
  //       "expanded": true,
  //       "pid": 0,
  //       "comments": "20140821-5",
  //       "items": [],
  //       "id": 5
  //     },
  //     {
  //       "text": "\u9500\u552e\u90e8",
  //       "expanded": true,
  //       "pid": 0,
  //       "comments": "20140821-6",
  //       "items": [
  //         {
  //           "text": "\u552e\u524d\u7ec4",
  //           "expanded": true,
  //           "pid": 6,
  //           "comments": "20140821-10",
  //           "items": [],
  //           "id": 10
  //         },
  //         {
  //           "text": "\u552e\u540e\u7ec4",
  //           "expanded": true,
  //           "pid": 6,
  //           "comments": "20140821-11",
  //           "items": [],
  //           "id": 11
  //         }
  //       ],
  //       "id": 6
  //     }
  //   ]
  // }];

  // cargoCategoryTree2: Data.kendoTreeView()

  constructor(private statisticsChargeService: StatisticsChargeService,
              private cargoInfoService: CargoInfoService,
              // private cargoCategoryService: CargoCategoryService,
              private dataSourceFactory: DataSourceFactory) {
    // this.cargoCategoryTree = new kendo.data.TreeListDataSource({
    //   transport: {
    //     read: (options) => {
    //       options.success(this.tree);
    //       // this.cargoCategoryService.listCargoCategory()
    //       //   .then( options.success, er => options.error('', '', er));
    //     }
    //   },
    //   schema: {
    //     model: {
    //       id: 'id',
    //       parentId: 'pid',
    //       expanded: true
    //     }
    //   }
    // });
    // this.cargoCategoryTree = $("#treeView").kendoDropDownList();
    // console.log(this.cargoCategoryTree)
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
    this.dataSource.read();
  }

  reset() {
    this.criteria = {};
    this.dataSource.read();
  }

}
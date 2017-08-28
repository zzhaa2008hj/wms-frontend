import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import * as moment from 'moment';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { MonthlyInventoryService } from '@app/report/services/monthly-inventory';
import { addHeader, print } from '@app/common/services/print-tool';
import { MonthlyInventoryVo, MonthlyInventory, MonthsInventoryVo } from '@app/report/models/monthly-inventory';
import { StorageInfoVo } from '@app/report/models/storage-info';
import { StorageInfoService } from '@app/report/services/storage-info';

export class StorageHistoryList {
  maxDate;
  search = {
    searchDate: '',
    type: 1
  };
  dataSource: kendo.data.DataSource;
  types = [{ id: 1, name: '按客户' }, { id: 2, name: '按货物' }, { id: 3, name: '按总计' }];
  titleDate: string;

  searchDatePicker: any;

  arr = [] as MonthlyInventoryVo[];
  totalMonthlyInventory: MonthlyInventory;
  monthsInventoryVo: MonthsInventoryVo;
  storageInfoVoes: StorageInfoVo[];
  units: DictionaryData[] = [] as DictionaryData[];

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private dataSourceFactory: DataSourceFactory,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private monthlyInventoryService: MonthlyInventoryService,
              @inject private storageInfoService: StorageInfoService) {
  }

  async activate() {
    this.getMaxDate();
    this.search.searchDate = moment(this.maxDate).format("YYYY-MM-DD");
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.monthlyInventoryService.page(this.search).map(res => {
        let dict = this.units.find(r => r.dictDataCode == res.unit);
        if (dict) {
          res.unitName = dict.dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
    //this.getItems();
  }

  select() {
    this.search.searchDate = this.search.searchDate ? moment(this.search.searchDate).format("YYYY-MM-DD") : '';
    this.dataSource.read();
  }

  endChange() {
    let endDate = new Date();
    endDate.setDate(endDate.getDate());

    // if (endDate) {
    //   endDate = new Date(endDate);
    //   endDate.setDate(endDate.getDate());
    //   this.startDatePicker.max(endDate);
    // } else if (startDate) {
    //   this.endDatePicker.min(new Date(startDate));
    // } else {
    //   endDate = new Date();
    //   this.startDatePicker.max(endDate);
    //   this.endDatePicker.min(endDate);
    // }
    this.searchDatePicker.max(endDate);
  }

  async getItems() {
    this.select();
    this.storageInfoVoes = await this.storageInfoService.list({ searchDate: this.search.searchDate, type: 2 });
    this.storageInfoVoes
      .map(re => {
        re.list = re.list.filter(r => {
          return r.warehouseName != re.warehouseName;
        });
        return re;
      });
    this.titleDate = this.search.searchDate ? moment(this.search.searchDate).format("YYYY-MM") : '';
    this.arr = await this.monthlyInventoryService.list(this.search);
    await this.arr.map(ar => {
      ar.list.map(res => {
        res.unit = this.units.find(r => r.dictDataCode == res.unit).dictDataName;
        return res;
      });
      return ar;
    });
    this.totalMonthlyInventory = await this.monthlyInventoryService.getTotalByMonth(this.search.searchDate);
    this.monthsInventoryVo = await this.monthlyInventoryService.getTotalByMonths(this.search.searchDate);
    // this.storageInfoVoes = await this.storageInfoService.list({searchDate: this.search.searchDate, type: 2});

    this.print();
  }

  print() {
    let title = "每月出入库明细";
    let strHTML = $("#monthlyInventory").html();
    strHTML = addHeader(strHTML);

    print(title, strHTML, true, 2);
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
}
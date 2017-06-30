import { inject } from "aurelia-dependency-injection";
import { StorageService } from "@app/base/services/storage";
import { DataSourceFactory } from "@app/utils";
import * as moment from 'moment';

export class StorageHistoryList {
  search = {
    beginDate: '',
    endDate: ''
  };
  dataSource: kendo.data.DataSource;
  types = [{id: 1, name: '正常业务流程'}, {id: 2, name: '库存调整'}, {id: 3, name: '溢短抹平'}];
   businessTypes = [{id: 1, name: '入库业务'}, {id: 2, name: '出库业务'}, {id: 3, name: '货权转移'}, 
                    {id: 4, name: '货位转移'}, {id: 5, name: '货物质押'}, {id: 6, name: '合同'}, {id: 7, name: '零星作业'}];

  startDatePicker: any;
  endDatePicker: any;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private storageService: StorageService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.storageService.queryStorageHistoryPage(this.search),
      pageSize: 10
    });
  }

  select() {
    this.search.beginDate = this.search.beginDate ? moment(this.search.beginDate).format("YYYY-MM-DD") : '';
    this.search.endDate = this.search.endDate ? moment(this.search.endDate).format("YYYY-MM-DD") : '';
    this.dataSource.read();
  }

  // kendo controls aren't ready yet in the attached() callback
  // so we use the aurelia-after-attached-plugin which adds the afterAttached callback
  // https://github.com/aurelia-ui-toolkits/aurelia-after-attached-plugin
  afterAttached() {
    this.startDatePicker.max(this.endDatePicker.value());
    this.endDatePicker.min(this.startDatePicker.value());
  }

  startChange() {
    let startDate = this.startDatePicker.value();
    let endDate = this.endDatePicker.value();

    if (startDate) {
      startDate = new Date(startDate);
      startDate.setDate(startDate.getDate());
      this.endDatePicker.min(startDate);
    } else if (endDate) {
      this.startDatePicker.max(new Date(endDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }

  endChange() {
    let endDate = this.endDatePicker.value();
    let startDate = this.startDatePicker.value();

    if (endDate) {
      endDate = new Date(endDate);
      endDate.setDate(endDate.getDate());
      this.startDatePicker.max(endDate);
    } else if (startDate) {
      this.endDatePicker.min(new Date(startDate));
    } else {
      endDate = new Date();
      this.startDatePicker.max(endDate);
      this.endDatePicker.min(endDate);
    }
  }
}
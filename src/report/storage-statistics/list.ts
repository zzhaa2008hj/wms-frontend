import { inject } from "aurelia-dependency-injection";
import { DataSourceFactory } from "@app/utils";
import * as moment from 'moment';
import { StorageInfoService } from '@app/report/services/storage-info';
import { WarehouseService } from "@app/base/services/warehouse"

export class StorageList {
  search = {
    searchDate: '',
    type: 1,
    warehouseId: ''
  };

  dataSource: kendo.data.DataSource;
  types = [{ id: 1, name: '每日库存统计' }, { id: 2, name: '每月库存统计' }];

  itemsDataSources = new Map<string, kendo.data.DataSource>();

  startDatePicker: any;
  endDatePicker: any;

  warehourseSource = new kendo.data.DataSource({
    transport: {
      read: options => {
        this.warehouseService.getTopWarehouses()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  });

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private dataSourceFactory: DataSourceFactory,
              @inject private storageInfoService: StorageInfoService,
              @inject private warehouseService: WarehouseService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.storageInfoService.page(this.search),
      pageSize: 10
    });

    this.dataSource.bind("change", (e) => {
      for (let item of e.items) {
        let itemDatasource = new kendo.data.DataSource({
          transport: {
            read: options => {
              options.success(item.list);
            }
          }
        });
        this.itemsDataSources.set(item.uid, itemDatasource);
      }
    });


  }

  async activate() {
  }

  select() {
    console.log("this.search", this.search);
    this.search.searchDate = this.search.searchDate ? moment(this.search.searchDate).format("YYYY-MM-DD") : '';
    this.dataSource.read();
  }

  // kendo controls aren't ready yet in the attached() callback
  // so we use the aurelia-after-attached-plugin which adds the afterAttached callback
  // https://github.com/aurelia-ui-toolkits/aurelia-after-attached-plugin
  // afterAttached() {
  //     this.startDatePicker.max(this.endDatePicker.value());
  //     this.endDatePicker.min(this.startDatePicker.value());
  // }

  // startChange() {
  //     let startDate = this.startDatePicker.value();
  //     let endDate = this.endDatePicker.value();

  //     if (startDate) {
  //         startDate = new Date(startDate);
  //         startDate.setDate(startDate.getDate());
  //         this.endDatePicker.min(startDate);
  //     } else if (endDate) {
  //         this.startDatePicker.max(new Date(endDate));
  //     } else {
  //         endDate = new Date();
  //         this.startDatePicker.max(endDate);
  //         this.endDatePicker.min(endDate);
  //     }
  // }

  // endChange() {
  //     let endDate = this.endDatePicker.value();
  //     let startDate = this.startDatePicker.value();

  //     if (endDate) {
  //         endDate = new Date(endDate);
  //         endDate.setDate(endDate.getDate());
  //         this.startDatePicker.max(endDate);
  //     } else if (startDate) {
  //         this.endDatePicker.min(new Date(startDate));
  //     } else {
  //         endDate = new Date();
  //         this.startDatePicker.max(endDate);
  //         this.endDatePicker.min(endDate);
  //     }
  // }

  getNewDataSourceByUid(uid: string) {
    return this.itemsDataSources.get(uid);
  }

  typeChange() {
    this.dataSource.read();
  }

}
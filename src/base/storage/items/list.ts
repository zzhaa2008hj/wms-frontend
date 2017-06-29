import { inject} from "aurelia-dependency-injection";
import { StorageService } from "@app/base/services/storage";
import { DataSourceFactory } from "@app/utils";
import {StorageInfo} from "@app/base/models/storage-info";

export class StorageItemList {
  keywords: string;
  dataSource: kendo.data.DataSource;
  storageInfoId: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private storageService: StorageService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject("storageInfo") private storageInfo: StorageInfo) {
    this.storageInfoId = this.storageInfo.id;
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.storageService.queryStorageItemPage(this.storageInfo.id, this.keywords),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
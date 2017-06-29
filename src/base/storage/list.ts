import { inject } from "aurelia-dependency-injection";
import { StorageService } from "@app/base/services/storage";
import { DataSourceFactory } from "@app/utils";

export class StorageList {
  keywords: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private storageService: StorageService,
              @inject private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.storageService.queryStoragePage(this.keywords),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
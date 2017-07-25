import { inject } from "aurelia-dependency-injection";
import { StorageService } from "@app/base/services/storage";
import { DataSourceFactory } from "@app/utils";
import { DictionaryDataService } from '@app/base/services/dictionary';

export class StorageList {
  keywords: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private storageService: StorageService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private dictionaryDataService: DictionaryDataService) {
  }
  async activate() {
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.storageService.queryStoragePage(this.keywords).map(res => {
        let dict = units.find(r => r.dictDataCode == res.unit);
        if (dict) {
          res.unitName = dict.dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
}
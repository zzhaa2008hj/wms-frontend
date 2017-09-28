import { inject } from "aurelia-dependency-injection";
import { StorageService } from "@app/base/services/storage";
import { DataSourceFactory } from "@app/utils";
import { StorageInfo } from "@app/base/models/storage";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DialogService } from 'ui';
import { WarehouseTree } from "@app/base/warehouse/tree";

export class StorageItemList {
  dataSource: kendo.data.DataSource;
  storageInfoId: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  selectedWarehouse: string;
  selectedWarehouseName: string;
  title: string;
  
  constructor(@inject private storageService: StorageService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject("storageInfo") private storageInfo: StorageInfo,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private dialogService: DialogService) {
  }

  async activate() {
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.storageInfoId = this.storageInfo.id;
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.storageService.queryStorageItemPage(this.storageInfo.id, this.selectedWarehouse).map(res => {
        let dict = units.find(r => r.dictDataCode == res.unit);
        if (dict) {
          res.unitName = dict.dictDataName;
        }
        this.title = res.customerName + '--' + res.cargoName;
        return res;
      }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }
  reset() {
    this.selectedWarehouseName = '';
    this.selectedWarehouse = '';
    this.dataSource.read();
  }

  async selected() {
    let result = await this.dialogService
      .open({ viewModel: WarehouseTree, model: this.selectedWarehouse, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    this.selectedWarehouseName = result.output.name;
    this.selectedWarehouse = result.output.id;
  }
}
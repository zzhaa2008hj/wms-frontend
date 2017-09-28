import { inject } from "aurelia-dependency-injection";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DialogController } from 'ui';
import { TransferStorageItemVo } from '@app/cargo-ownership/models/cargo-ownership';

export class StorageItemView {
  storageItems: TransferStorageItemVo[] = [];
  dataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.storageItems);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });

  title: string;
  constructor( @inject private dialogController: DialogController,
    @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate({ storageItems, title }) {
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.title = title;
    this.storageItems = storageItems;
    this.storageItems.forEach(item => {
      let unit = units.find(u => u.dictDataCode == item.unit);
      if (unit) {
        item.unitName = unit.dictDataName;
      }
    });
  }

  cancel() {
    this.dialogController.cancel();
  }
}
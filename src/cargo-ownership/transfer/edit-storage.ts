import { inject } from "aurelia-dependency-injection";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DialogService, DialogController } from 'ui';
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
    },
    autoSync: true,
    schema: {
      model: {
        id: 'id',
        fields: {
          quantity: { editable: false },
          number: { editable: false },
          warehouseName: { editable: false },
          containerNumber: { editable: false },
          storageQuantity: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 } },
          storageNumber: { editable: true, type: 'number', validation: { required: false, min: 0, max: 10000000 } },
          unitName: { editable: false },
          remark: { editable: true },
        }
      }
    }
  });

  title: string;
  constructor( @inject private dialogController: DialogController,
    @inject private dictionaryDataService: DictionaryDataService,
    @inject private dialogService: DialogService) {
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

  async save() {
    await this.dataSource.sync();
    if (this.storageItems && this.storageItems.length > 0) {
      for (let item of this.storageItems) {
        if (item.storageNumber > item.number) {
          this.dialogService.alert({ title: "提示", message: '件数不能大于可转件数', icon: 'error' });
          return;
        }
        if (item.storageQuantity > item.quantity) {
          this.dialogService.alert({ title: "提示", message: '数量不能大于可转数量', icon: 'error' });
          return;
        }
      }
    }
    this.dialogController.ok(this.storageItems);
  }

  cancel() {
    this.dialogController.cancel();
  }
}
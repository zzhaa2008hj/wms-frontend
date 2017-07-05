import { autoinject } from "aurelia-dependency-injection";
import { DialogController, MessageDialogService, DialogService } from 'ui';
import { ChangeHistory } from '@app/common/models/change-history';
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { DetailsCargoItem } from '@app/base/cargo-info/item-details';

@autoinject
export class CargoInfoChangeHistoryDetail {

  oldCargoInfo: CargoInfo;
  newCargoInfo: CargoInfo;
  oldCargoItems: CargoItem[];
  newCargoItems: CargoItem[];
  oldDataSource: kendo.data.DataSource;
  newDataSource: kendo.data.DataSource;

  constructor(private dialogController: DialogController,
              private messageDialogService: MessageDialogService,
              private dialogService: DialogService) {

  }

  async activate(changeHistory: ChangeHistory<CargoInfo>) {
    this.oldCargoInfo = changeHistory.oldObj;
    this.newCargoInfo = changeHistory.newObj;

    this.oldCargoItems = await this.oldCargoInfo.cargoItems;
    this.newCargoItems = await this.newCargoInfo.cargoItems;

    this.oldDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.oldCargoItems);
        }
      }
    });
    this.newDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.newCargoItems);
        }
      }
    });
  }

  async view(id, type) {
    let cargoItemList = [];
    if (type == 1) {
      cargoItemList = this.oldCargoItems.filter(x => x.id == id);
    } else {
      cargoItemList = this.newCargoItems.filter(x => x.id == id);
    }
    if (cargoItemList.length == 0) {
      this.messageDialogService.alert({ title: '错误', message: '该货物不存在！' });
      return;
    }
    let cargoItemInfo = cargoItemList[0];
    let result = await this.dialogService.open({
      viewModel: DetailsCargoItem,
      model: { cargoItemInfo },
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
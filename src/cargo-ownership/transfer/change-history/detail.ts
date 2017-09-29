import { autoinject } from "aurelia-dependency-injection";
import { DialogController, DialogService } from 'ui';
import { ChangeHistory } from '@app/common/models/change-history';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import * as moment from 'moment';
import { CargoownershipTransfer } from '@app/cargo-ownership/models/cargo-ownership';
import { RateView } from '@app/cargo-ownership/transfer/view-rate';
import { StorageItemView } from '@app/cargo-ownership/transfer/view-storage';

@autoinject
export class ChangeHistoryDetail {

  oldTransfer: CargoownershipTransfer;
  newTransfer: CargoownershipTransfer;
  units = [] as DictionaryData[];
  // 货物信息
  oldCargoItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.oldTransfer.transferItems);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });

  // 货物信息
  newCargoItemDataSource = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.newTransfer.transferItems);
      },
      update: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });

  constructor(private dialogController: DialogController,
              private dialogService: DialogService,
              private dictionaryDataService: DictionaryDataService) {
  }

  async activate(changeHistory: ChangeHistory<CargoownershipTransfer>) {

    this.oldTransfer = changeHistory.oldObj;
    this.newTransfer = changeHistory.newObj;

    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.oldTransfer.storageEndDateStr = moment(this.oldTransfer.storageEndDate).format("YYYY-MM-DD");
    this.oldTransfer.transferDateStr = moment(this.oldTransfer.transferDate).format("YYYY-MM-DD");
    this.oldTransfer.transferItems.forEach(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        item.unitName = unit.dictDataName;
      }
    });
    this.newTransfer.storageEndDateStr = moment(this.newTransfer.storageEndDate).format("YYYY-MM-DD");
    this.newTransfer.transferDateStr = moment(this.newTransfer.transferDate).format("YYYY-MM-DD");
    this.newTransfer.transferItems.forEach(item => {
      let unit = this.units.find(d => item.unit == d.dictDataCode);
      if (unit) {
        item.unitName = unit.dictDataName;
      }
    });
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  /**
   * 查看费率
   */
  async showOldRate(cargoItem) {
    this.dialogService.open({viewModel: RateView, model: cargoItem.cargoRates, lock: true});
  }

  /**
   * 库存信息
   */
  async showOldStorage(cargoItem) {
    this.dialogService.open({viewModel: StorageItemView, model: {storageItems: cargoItem.storageItems, title: cargoItem.cargoCategoryName}, lock: true});
  }

  /**
   * 查看费率
   */
  async showNewRate(cargoItem) {
    this.dialogService.open({viewModel: RateView, model: cargoItem.cargoRates, lock: true});
  }

  /**
   * 库存信息
   */
  async showNewStorage(cargoItem) {
    this.dialogService.open({viewModel: StorageItemView, model: {storageItems: cargoItem.storageItems, title: cargoItem.cargoCategoryName}, lock: true});
  }
}
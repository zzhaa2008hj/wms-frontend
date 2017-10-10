import { InstockOrder } from '@app/instock/models/instock-order';
import { DetailsCargoItem } from '@app/base/cargo-info/item-details';
import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { Order } from '@app/outstock/models/order';
import { fixDate } from '@app/utils';
import { CargoownershipTransfer } from '@app/cargo-ownership/models/cargo-ownership';
import { CargoownershipTransferService } from '@app/cargo-ownership/services/cargo-ownership';
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
@autoinject
export class DetailsCargoInfo {
  cargoInfo = {} as CargoInfo;
  cargoItems = [] as CargoItem[];
  cargoInfoId = '';
  dataSource: kendo.data.DataSource;

  units = [] as DictionaryData[];

  instockOrders: InstockOrder[];
  instockDatasource: kendo.data.DataSource;

  outstockOrders: Order[];
  outstockDatasource: kendo.data.DataSource;

  cargoOwnershipTransfers = [] as CargoownershipTransfer[];
  cargoOwnershipTransferDataSource: kendo.data.DataSource;

  cargoPositionTransfers = [] as PositionTransferInfo[];
  cargoPositionTransfersDateSource: kendo.data.DataSource;

  constructor(private router: Router,
    private cargoownershipTransferService: CargoownershipTransferService,
    private positionTransferInfoService: PositionTransferInfoService,
    private cargoInfoService: CargoInfoService,
    private messageDialogService: MessageDialogService,
    private dictionaryDataService: DictionaryDataService,
    private dialogService: DialogService) {
    this.dataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.cargoItems);
        }
      }
    });

    this.instockDatasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.instockOrders);
        }
      }
    });

    this.outstockDatasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.outstockOrders);
        }
      }
    });

    this.cargoOwnershipTransferDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.cargoOwnershipTransfers);
        }
      }
    });

    this.cargoPositionTransfersDateSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.cargoPositionTransfers);
        }
      }
    });
  }

  async activate({ id, batchNumber }) {
    //入库指令信息
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(id);
    this.cargoItems = await this.cargoInfoService.getCargoItems(id);
    this.cargoItems.map(res => res.unitStr = this.units.find(d => d.dictDataCode == res.unit).dictDataName);
    //入库信息
    this.instockOrders = await this.cargoInfoService.getInstockOrder(id);
    this.instockOrders.map(res => {
      let unit = this.units.find(d => d.dictDataCode == res.unit);
      if (unit) {
        res.unit = unit.dictDataName;
      }
    });
    //出库信息
    this.outstockOrders = await this.cargoInfoService.getOutstockOrders(id);
    this.outstockOrders.map(res => {
      let unit = this.units.find(d => d.dictDataCode == res.unit);
      if (unit) {
        res.unit = unit.dictDataName;
      }
      fixDate(res, "outstockDate");
    });
    //货权转移信息
    this.cargoOwnershipTransfers = await this.cargoownershipTransferService.getTsfSuccessList(batchNumber)
    this.cargoOwnershipTransfers.map(x => {
      fixDate(x, "transferDate");
      fixDate(x, "storageEndDate");
    });
    //货位转移信息
    this.cargoPositionTransfers = await this.positionTransferInfoService.getTsfSuccessList(batchNumber);
    this.cargoPositionTransfers.map(x => {
      fixDate(x, "createTime");
    });
  }

  async view(id) {
    let cargoItemList = this.cargoItems.filter(x => x.id == id);
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


  cancel() {
    this.router.navigateToRoute("list");
  }

}
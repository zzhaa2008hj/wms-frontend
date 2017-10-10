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
import { PositionTransferInfoService } from "@app/cargo-position/services/transfer-info";
import { PositionTransferInfo } from "@app/cargo-position/models/transfer-info";

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

  positionOrders: PositionTransferInfo[];
  positionDataSource: kendo.data.DataSource;

  constructor(private router: Router,
              private cargoInfoService: CargoInfoService,
              private messageDialogService: MessageDialogService,
              private positionTransferInfoService: PositionTransferInfoService,
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

    this.positionDataSource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.positionOrders);
        }
      }
    });
  }

  async activate({ id }) {
    //入库指令信息
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(id);
    this.cargoItems = await this.cargoInfoService.getCargoItems(id);
    this.cargoItems.map(res => res.unitStr = this.units.find(d => d.dictDataCode == res.unit).dictDataName);
    //todo
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
    //todo 货权转移

    //货位转移信息
    this.positionOrders = await this.positionTransferInfoService.getPositionOrders(id);
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
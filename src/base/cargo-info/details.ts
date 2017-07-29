import { OutstockInventory } from '@app/outstock/models/inventory';
import { InstockOrder } from '@app/instock/models/instock-order';
import { DetailsCargoItem } from '@app/base/cargo-info/item-details';
import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService, DialogService } from "ui";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo, CargoItem } from '@app/base/models/cargo-info';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';

@autoinject
export class DetailsCargoInfo {
  cargoInfo = {} as CargoInfo;
  cargoItems = [] as CargoItem[];
  cargoInfoId = '';
  dataSource: kendo.data.DataSource;
  warehouseTypes = [] as DictionaryData[];

  units = [] as DictionaryData[];

  instockOrders: InstockOrder[];
  instockDatasource: kendo.data.DataSource;

  outstockInventories: OutstockInventory[];
  outstockDatasource: kendo.data.DataSource;

  constructor(private router: Router,
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
          options.success(this.outstockInventories);
        }
      }
    });
  }

  async activate({ id }) {
    //入库指令信息
    this.units = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
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
    this.outstockInventories = await this.cargoInfoService.getOutstockInventories(id);
    this.outstockInventories.map(res => {
      let unit = this.units.find(d => d.dictDataCode == res.unit);
      if (unit) {
        res.unit = unit.dictDataName;
      }
    });
    //todo
    //货权转移、货位转移
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
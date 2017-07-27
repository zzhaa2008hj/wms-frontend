import { InstockOrderService } from '@app/instock/services/instock-order';
import { InstockOrderVo } from '@app/instock/models/instock-order';
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
  datasource: kendo.data.DataSource;
  warehouseTypes = [] as DictionaryData[];
  unit = [] as DictionaryData[];

  instockOrderVo: InstockOrderVo;
  instockDatasource: kendo.data.DataSource;
  units = [] as DictionaryData[];

  constructor(private router: Router,
    private cargoInfoService: CargoInfoService,
    private messageDialogService: MessageDialogService,
    private dictionaryDataService: DictionaryDataService,
    private instockOrderService: InstockOrderService,
    private dialogService: DialogService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.cargoItems);
        }
      }
    });
  }

  async activate({ id }) {
    //入库指令信息
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseTypes = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(id);
    this.cargoItems = await this.cargoInfoService.getCargoItems(id);
    this.cargoItems.map(res => res.unitStr = this.unit.find(d => d.dictDataCode == res.unit).dictDataName);
    //todo
    //获取出入库信息、货权转移、货位转移
    this.instockOrderVo = await this.instockOrderService.getInstockOrder(id);
    this.instockOrderVo.orderItems.map(res => {
      let unit = this.units.find(d => res.unit == d.dictDataCode);
      console.log(unit)
      if (unit) {
        // 只是查看
        res.unit = unit.dictDataName;
      }
    });
    this.instockDatasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.instockOrderVo.orderItems);
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
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
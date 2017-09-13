import { Router } from "aurelia-router";
import { inject } from 'aurelia-dependency-injection';
import { CargoDistrainService } from "@app/outstock/services/cargo-distrain";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from '@app/base/models/cargo-info';
import { CargoItemStorageInfoVo, CargoDistrainVo} from '@app/outstock/models/cargo-distrain';
import { DialogService } from "ui";
import { NewDistrain } from "@app/outstock/cargo-distrain/new-distrain";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';

export class NewCargoDistrain {
  cargoInfoWidget: any; // 组件
  cargoInfos: CargoInfo[];
  cargoDistrainVos: CargoDistrainVo[] = [];
  cargoItems: CargoItemStorageInfoVo[] = [];
  disabled: boolean = false;
  units: DictionaryData[] = [];

  dataSourceCargoItem = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoItems);
      }
    }
  });

  dataSourceCargoDistrain = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoDistrainVos);
      }
    }
  });

  constructor(@inject private router: Router,
              @inject private cargoInfoService: CargoInfoService,
              @inject private dialogService: DialogService,
              @inject private cargoDistrainService: CargoDistrainService,
              @inject private dictionaryDataService: DictionaryDataService) {
  }

  async activate() {
    //this.cargoInfos = await this.cargoInfoService.getCargoInfosByInstockStatus(1);
    this.cargoInfos = await this.cargoInfoService.listBaseCargoInfos({ instockStatus: -3, outstockStatus: 0 });
    this.cargoInfos.map(res => {
      res.batchNumberStr = res.batchNumber + "(" + res.customerName + ")";
    });
    this.units = await this.dictionaryDataService.getDictionaryDatas('unit');
  }

  async onSelectCargoInfo(e) {
    
    // 获取选中的对象
    let cargoInfo: CargoInfo = this.cargoInfoWidget.dataItem(e.item);
    // 货物grid
    this.cargoItems = await this.cargoInfoService.getCargoItemStorageInfo(cargoInfo.id);
    this.cargoItems = this.cargoItems.map(res => {
       let dict = this.units.find(r => r.dictDataCode == res.cargoItem.unit);
        if (dict) {
          res.cargoItem.unitStr = dict.dictDataName;
        }
      return res;
    });
    this.dataSourceCargoItem.read();
  }

  /**
   * 增加数组对象
   */
  async addCargoDistrain(param) {
    let cargoItemStorageInfoVo = {} as CargoItemStorageInfoVo;
    Object.assign(cargoItemStorageInfoVo, param);

    let result = await this.dialogService.open({ viewModel: NewDistrain, model: {}, lock: true}).whenClosed();
    if (result.wasCancelled) return;
    let cargoDistrainVo: CargoDistrainVo = result.output;
    let dict = this.units.find(r => r.dictDataCode == cargoDistrainVo.unit);
    if (dict) {
      cargoDistrainVo.unitName = dict.dictDataName;
    }

    cargoDistrainVo.cargoName = cargoItemStorageInfoVo.cargoItem.cargoName;
    cargoDistrainVo.cargoCategoryName = cargoItemStorageInfoVo.cargoItem.cargoCategoryName;
    cargoDistrainVo.cargoSubCatergoryName = cargoItemStorageInfoVo.cargoItem.cargoSubCatergoryName;
    cargoDistrainVo.cargoItemId = cargoItemStorageInfoVo.cargoItem.id;
    cargoDistrainVo.batchNumber = cargoItemStorageInfoVo.cargoItem.batchNumber;
    this.cargoDistrainVos.push(cargoDistrainVo);
    this.dataSourceCargoDistrain.read();
  }
  /**
   * 删除数组对象
   */
  async deleteCargoDistrain(param) {
    let cargoDistrainVo = {} as CargoDistrainVo;
    Object.assign(cargoDistrainVo, param);
    this.cargoDistrainVos = this.cargoDistrainVos.filter(c => c.timestrap != cargoDistrainVo.timestrap);
    this.dataSourceCargoDistrain.read();
  }

  /**
   * 新增
   */
  async addNewCargoDistrain() {
    if ( this.cargoDistrainVos.length == 0) return;
    this.disabled = true;
    try {
      await this.cargoDistrainService.saveCargoDistrains(this.cargoDistrainVos);
      await this.dialogService.alert({ title: "提示", message: "新增成功"});
      this.cancel();
    } catch (err) {
      await this.dialogService.alert({ title: "提示", message: err.message, icon: 'error' });
      this.disabled = false;
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

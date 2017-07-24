import { inject } from "aurelia-dependency-injection";
import { CargoDistrainService } from "@app/outstock/services/cargo-distrain";
import { DataSourceFactory } from "@app/utils";
import { DialogService } from "ui";
import { CargoDistrainVo} from '@app/outstock/models/cargo-distrain';
import { EditDistrain } from '@app/outstock/cargo-distrain/edit';
import { DictionaryDataService } from '@app/base/services/dictionary';

export class InstockCargoDistrainList {
  batchNumber: string;
  dataSource: kendo.data.DataSource;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(@inject private cargoDistrainService: CargoDistrainService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private dialogService: DialogService,
              @inject private dictionaryDataService: DictionaryDataService) {
  }

  select() {
    this.dataSource.read();
  }

  async activate() {
    let units = await this.dictionaryDataService.getDictionaryDatas('unit');
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.cargoDistrainService.queryCargoDistrains(this.batchNumber).map(res => {
        let dict = units.find(r => r.dictDataCode == res.unit);
        if (dict) {
          res.unitName = dict.dictDataName;
        }
        return res;
      }),
      pageSize: 10
    });
  }

  /**
   * 修改状态
   */
  async updateStatus(id: string, status: number) {
    try {
      await this.cargoDistrainService.updateCargoDistrainStatus(id, status);
      await this.dialogService.alert({title: "", message: "修改状态成功！"});
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }

  /**
   * 修改
   */
  async editCargoDistrain(param) {
    let cargoDistrainVo = {} as CargoDistrainVo;
    Object.assign(cargoDistrainVo, param);

    let result = await this.dialogService.open({ viewModel: EditDistrain, model: cargoDistrainVo, lock: true}).whenClosed();
    if (result.wasCancelled) return;
    try {
      let cargoDistrain = result.output as CargoDistrainVo;
      await this.cargoDistrainService.updateCargoDistrain(cargoDistrain.id, cargoDistrain);
      await this.dialogService.alert({title: "", message: "修改成功！"});
      this.dataSource.read();
    } catch (err) {
      await this.dialogService.alert({title: "", message: err.message, icon: "error"});
    }
  }
}
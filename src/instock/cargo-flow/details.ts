import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/30.
 */
@autoinject
export class Details {
  cargoInfo: CargoInfo;
  cargoFlow: CargoFlow;
  cargoItems = [];
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });

  constructor(private cargoFlowService: CargoFlowService,
              private cargoInfoService: CargoInfoService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.cargoFlow.cargoInfoId);

    let cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    if (cargoItems) {
      for (let ci of cargoItems) {
        let cargoItem = await this.cargoItemService.getBaseCargoItemById(ci.cargoItemId);
        Object.assign(ci, { cargoSubCatergoryName: cargoItem.cargoSubCatergoryName, freeDays: cargoItem.freeDays });
        let vehicles = await this.vehicleService.listInstockVehicles(ci.id);
        vehicles.forEach(v => {
          Object.assign(v, { cargoName: ci.cargoName });
          this.vehicles.push(v);
        });
      }
    }
    this.dataSourceCargoItem.data(cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
  }

  formatStage(stage: number) {
    return ['初始阶段',
      '待商务审核',
      '商务审核未通过',
      '商务审核通过',
      '已生成入库指令单',
      '入库作业中',
      '作业完成（待审核）',
      '库场审核未通过',
      '已生成理货报告',
      '已生成入库单',
      '入库完成'][stage];
  }
}
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { ConstantValues } from "@app/common/models/constant-values";
import { Router } from "aurelia-router";
import { CargoFlowSeparateService } from "@app/instock/services/cargo-flow-seperate";
import { MessageDialogService } from "ui";
/**
 * Created by Hui on 2017/6/30.
 */
@autoinject
export class NewSeparate {
  cargoInfo: CargoInfo;
  cargoFlow: CargoFlow;
  cargoItems = [];
  instockStages: string[] = ConstantValues.InstockStages;
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceSeparateCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });
  dataSourceSeparateVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });

  constructor(private cargoFlowService: CargoFlowService,
              private router: Router,
              private cargoFlowSeparateService: CargoFlowSeparateService,
              private messageDialogService: MessageDialogService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoFlow.instockStageName = this.instockStages[this.cargoFlow.stage + 1];
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
    this.cargoItems = cargoItems;
    this.dataSourceCargoItem.data(cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
  }

  deleteCargoItem(e) {
    this.cargoItems.forEach(ci => {
      if (e.id == ci.id) {
        let index = this.cargoItems.indexOf(ci);
        this.cargoItems.splice(index, 1);
        //同时删除车辆信息
        this.vehicles.forEach(v => {
          if (v.instockGoodsId == ci.id) {
            this.deleteVehicle(v);
          }
        });
      }
    });
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
  }

  deleteVehicle(e) {
    this.vehicles.forEach(v => {
      if (e.id == v.id) {
        let index = this.vehicles.indexOf(v);
        this.vehicles.splice(index, 1);
        let judge = this.vehicles.filter(vv => vv.instockGoodsId == v.instockGoodsId);
        if (judge.length == 0) {
          e.id = v.instockGoodsId;
          this.deleteCargoItem(e);
        }
      }
    });
    this.dataSourceVehicle.data(this.vehicles);
  }


  async addCargoFlowSeparate() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    let orderQuantity = 0;
    let orderNumber = 0;
    if (vehicles || cargoItems) {
      cargoItems.forEach(ci => {
        orderQuantity += ci.orderQuantity;
        orderNumber += ci.orderNumber;
        let vs = [];
        vehicles.forEach(v => {
          if (ci.sign == v.sign) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }
    this.cargoFlow.orderQuantity = orderQuantity;
    this.cargoFlow.orderNumber = orderNumber;
    try {
      await this.cargoFlowSeparateService.saveCargoFlowSeparate(this.cargoFlow);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await
        this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}
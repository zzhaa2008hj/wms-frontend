import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { autoinject } from "aurelia-dependency-injection";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { ConstantValues } from "@app/common/models/constant-values";
import { CargoFlowSeparate } from "@app/instock/models/cargo-flow-separate";
import { DialogService, MessageDialogService } from "ui";
import { Router } from "aurelia-router";
import { NewSeparate } from "@app/instock/cargo-flow/separate/new";
/**
 * Created by Hui on 2017/6/30.
 */
@autoinject
export class Detail {
  cargoInfo: CargoInfo;
  cargoFlow: CargoFlow;
  cargoFlowSeparate: CargoFlowSeparate;
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
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private cargoInfoService: CargoInfoService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoInfo = await this.cargoInfoService.getCargoInfo(this.cargoFlow.cargoInfoId);
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
    this.dataSourceCargoItem.data(cargoItems);
    this.dataSourceVehicle.data(this.vehicles);

    this.cargoItems = cargoItems;
    this.dataSourceSeparateCargoItem.data(this.cargoItems);
    this.dataSourceSeparateVehicle.data(this.vehicles);
  }

  deleteVehicle(e) {
    this.vehicles.forEach(v => {
      if (e.id == v.id) {
        let index = this.vehicles.indexOf(v);
        this.vehicles.splice(index, 1);
      }
    });
    this.dataSourceSeparateVehicle.data(this.vehicles);
  }

  async add() {
    let result = await this.dialogService.open({
      viewModel: NewSeparate,
      model: { cargoFlow: this.cargoFlow, cargoItems: this.cargoItems },
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    console.log(result.output);
  }

  async addCargoFlowSeparate() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    if (vehicles) {
      cargoItems.forEach(ci => {
        let vs = [];
        vehicles.forEach(v => {
          if (ci.sign == v.sign) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
    }
    if (cargoItems) {
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }
    try {
      await this.cargoFlowService.saveCargoFlow(this.cargoFlow);
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
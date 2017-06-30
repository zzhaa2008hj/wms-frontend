import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoItemService } from "@app/instock/services/cargo-item";
import { InstockVehicleService } from "@app/instock/services/instock-vehicle";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class EditCargoFlow {
  cargoItems = [];
  cargoFlow = {} as CargoFlow;
  selectedCargoInfo: any;
  baseCargoInfo = {
    transport: {
      read: async options => {
        await this.cargoFlowService.listBaseCargoInfos()
          .then(options.success)
          .catch(err => options.error("", "", err));
      }
    }
  };
  dataSourceCargoItem = new kendo.data.HierarchicalDataSource({
    data: []
  });
  vehicles = [];
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });
  //入库新增先要录入客户基础信息,基础信息新增后 录入
  constructor(private router: Router,
              private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService,
              private vehicleService: InstockVehicleService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowById(params.id);
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    if (this.cargoItems) {
      for (let ci of this.cargoItems) {
        let vehicles = await this.vehicleService.listInstockVehicles(ci.id);
        vehicles.forEach(v => {
          Object.assign(v, { cargoName: ci.cargoName });
          this.vehicles.push(v);
        });
      }
    }
    this.dataSourceCargoItem.data(this.cargoItems);
    this.dataSourceVehicle.data(this.vehicles);
  }

  async addVehicle(cargoItem) {
    let result = await this.dialogService.open({
      viewModel: NewVehicle,
      model: cargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      this.vehicles.push(result.output);
      this.dataSourceVehicle.data(this.vehicles);
    }
  }

  deleteVehicle(e) {
    this.vehicles.forEach(v => {
      if (e.id == v.id) {
        let index = this.vehicles.indexOf(v);
        this.vehicles.splice(index, 1);
      }
    });
    console.log(this.vehicles);
    this.dataSourceVehicle.data(this.vehicles);
  }

  async updateCargoFlow() {
    let vehicles = [];
    Object.assign(vehicles, this.dataSourceVehicle.data());
    console.log(vehicles)
    let cargoItems = [];
    Object.assign(cargoItems, this.dataSourceCargoItem.data());
    if (vehicles) {
      cargoItems.forEach(ci => {
        let vs = [];
        vehicles.forEach(v => {
          if (ci.id == v.instockGoodsId) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      });
    }
    if (cargoItems) {
      Object.assign(this.cargoFlow, { cargoItems: cargoItems });
    }
    console.log(this.cargoFlow);
    try {
      await this.cargoFlowService.updateCargoFlow(this.cargoFlow);
      await this.messageDialogService.alert({ title: "修改成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await
        this.messageDialogService.alert({ title: "修改失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    console.log(this.dataSourceVehicle.data());
    this.router.navigateToRoute("list");
  }
}
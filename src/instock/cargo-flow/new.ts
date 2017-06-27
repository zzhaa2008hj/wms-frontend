import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoFlow, InstockCargoItem } from "@app/instock/models/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { EditVehicle } from "@app/instock/cargo-flow/vehicle/edit";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class NewCargoFlow {
  cargoFlow: CargoFlow;
  selectedCargoInfo: any;
  baseCargoInfo = {
    transport: {
      read: async options => {
        try {
          let res = await this.cargoFlowService.listCargoInfos();
          options.success(res);
        } catch (err) {
          options.error("", "", err);
        }
      }
    }
  }
  selectedCargoItem: any;
  baseCargoItem = {
    transport: {
      read: async options => {
        try {
          let res = await this.cargoFlowService.listCargoItems(this.selectedCargoInfo.value());
          options.success(res);
        } catch (err) {
          options.error("", "", err);
        }
      }
    }
  }
  cargoItem: InstockCargoItem;
  vehicle = new Array;
  dataSourceVehicle = new kendo.data.HierarchicalDataSource({
    data: []
  });
  //入库新增先要录入客户基础信息,基础信息新增后 录入
  constructor(private router: Router,
              private cargoFlowService: CargoFlowService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
  }

  onSelectCargoInfo(e) {
    let dataItem = this.selectedCargoInfo.dataItem(e.item);
    console.log(dataItem);
    this.cargoFlow = dataItem;
    this.cargoFlow.cargoInfoId = dataItem.id;
    this.cargoFlow.id = null;
  }

  onSelectCargoItem(e) {
    let dataItem = this.selectedCargoItem.dataItem(e.item);
    console.log(dataItem);
    this.cargoItem = dataItem;
    this.cargoItem.cargoItemId = dataItem.id;
    this.cargoItem.id = null;
  }

  async addVehicle() {
    let result = await this.dialogService.open({ viewModel: NewVehicle, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let r = [0, 1, 2, 3].sort(() => Math.random() - 0.5).toString();
    let ob = {};
    Object.assign(ob, result.output);
    Object.assign(ob, { sign: r });
    this.vehicle.push(ob);
    this.dataSourceVehicle.data(this.vehicle);
  }

  async editVehicle(e) {
    let result = await this.dialogService.open({ viewModel: EditVehicle, model: e, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    let vehicle = result.output;
    for (let o of this.vehicle) {
      if (vehicle.sign == o.sign) {
        let index = this.vehicle.indexOf(o);
        this.vehicle.splice(index, 1, vehicle);
      }
    }
    this.dataSourceVehicle.data(this.vehicle);
  }

  deleteVehicle(e) {
    for (let o of this.vehicle) {
      if (e.sign == o.sign) {
        let index = this.vehicle.indexOf(o);
        this.vehicle.splice(index, 1);
      }
    }
    this.dataSourceVehicle.data(this.vehicle);
  }

  async addNewCargoFlow() {
    Object.assign(this.cargoFlow, { cargoItem: this.cargoItem }, { vehicle: this.vehicle });
    console.log(this.cargoFlow);
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
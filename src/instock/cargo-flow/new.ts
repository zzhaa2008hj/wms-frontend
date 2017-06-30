import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class NewCargoFlow {
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
  dataSourceCargoItem = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.cargoItems);
      },
      update: (options) => {
        options.success();
      },
      create: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    },
  });
  vehicle = [];
  dataSourceVehicle = new kendo.data.DataSource({
    transport: {
      read: (options) => {
        options.success(this.vehicle);
      },
      update: (options) => {
        options.success();
      },
      create: (options) => {
        options.success();
      },
      destroy: (options) => {
        options.success();
      }
    }
  });
  containerNumber = "";
  //入库新增先要录入客户基础信息,基础信息新增后 录入
  constructor(private router: Router,
              private cargoFlowService: CargoFlowService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
  }

  async onSelectCargoInfo(e) {
    let dataItem = this.selectedCargoInfo.dataItem(e.item);
    this.cargoFlow = dataItem;
    this.cargoFlow.cargoInfoId = dataItem.id;
    this.cargoFlow.id = null;
    this.cargoFlow.contactNumber = null;
    this.cargoFlow.lastBatch = "1";
    let res = await this.cargoFlowService.listBaseCargoItems(this.cargoFlow.cargoInfoId);
    Object.assign(this.cargoItems, res);
    this.cargoItems.forEach(ci => {
      let r = [0, 1, 2, 3].sort(() => Math.random() - 0.5).toString();
      Object.assign(ci, { sign: r });
      ci.cargoItemId = ci.id;
      ci.id = null;
    });
    this.dataSourceCargoItem.read();
  }

  async addVehicle(cargoItem) {
    let result = await this.dialogService.open({
      viewModel: NewVehicle,
      model: cargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      this.vehicle.push(result.output);
      this.dataSourceVehicle.read();
    }
  }

  deleteVehicle(e) {
    this.vehicle.forEach(v => {
      if (e.sign == v.sign) {
        let index = this.vehicle.indexOf(v);
        this.vehicle.splice(index, 1);
      }
    });
    this.dataSourceVehicle.read();
  }

  async addNewCargoFlow() {
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
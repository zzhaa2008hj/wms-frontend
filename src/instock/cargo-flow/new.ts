import { Router } from "aurelia-router";
import { DialogService, MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewVehicle } from "@app/instock/cargo-flow/vehicle/new";
import { CargoFlow, InstockCargoItem } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class NewCargoFlow {
  cargoItems = [] as InstockCargoItem[];
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
    }
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
    });
    console.log(this.cargoItems);
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

  // deleteVehicle(e) {
  //   console.log(e);
  //   this.vehicless.forEach(item => {
  //     item.vehicles.forEach(v => {
  //       if (e.sign == v.sign) {
  //         let index = item.indexOf(e);
  //         item.vehicles.splice(index, 1);
  //       }
  //     });
  //   });
  // }

  async addNewCargoFlow() {
    if (this.vehicle) {
      for (let ci of this.cargoItems) {
        let vs = [];
        this.vehicle.forEach(v => {
          if (ci.sign == v.sign) {
            vs.push(v);
          }
        });
        Object.assign(ci, { vehicles: vs });
      }
    }
    if(this.cargoItems){
      Object.assign(this.cargoFlow, { cargoItems: this.cargoItems });
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
    console.log(this.vehicle);
    console.log(this.cargoItems);
    // this.router.navigateToRoute("list");
  }
}
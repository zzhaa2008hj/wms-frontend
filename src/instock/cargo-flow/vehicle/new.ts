import { DialogController, DialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { InstockCargoItem, Vehicle } from "@app/instock/models/cargo-flow";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { NewCargoItem } from "@app/instock/cargo-flow/vehicle/item/new";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewVehicle {
  vehicle = {} as Vehicle;
  cargoInfoId: string;
  isContainer: string;
  selectedCargoItemIds: any;
  baseCargoItem = {
    transport: {
      read: async options => {
        try {
          let res = await this.cargoFlowService.listBaseCargoItems(this.cargoInfoId);
          options.success(res);
        } catch (err) {
          options.error("", "", err);
        }
      }
    }
  };
  cargoItems = [] as InstockCargoItem[];
  cargoItemC = new Array;
  dataSourceContainer = new kendo.data.HierarchicalDataSource({
    data: []
  });

  constructor(private dialogController: DialogController,
              private dialogService: DialogService,
              private cargoFlowService: CargoFlowService) {

  }

  activate(cargoInfoId: string) {
    this.cargoInfoId = cargoInfoId;
  }

  async addContainer() {
    let result = await this.dialogService.open({
      viewModel: NewCargoItem,
      model: this.baseCargoItem,
      lock: true
    }).whenClosed();
    if (result.wasCancelled) return;
    if (result.output) {
      let r = [0, 1, 2, 3].sort(() => Math.random() - 0.5).toString();
      let ob = {};
      Object.assign(ob, result.output);
      Object.assign(ob, { sign: r });
      this.cargoItemC.push(ob);
      this.dataSourceContainer.data(this.cargoItemC);
    }
  }

  deleteContainer(e) {
    for (let o of this.cargoItemC) {
      if (e.sign == o.sign) {
        let index = this.cargoItemC.indexOf(o);
        this.cargoItemC.splice(index, 1);
      }
    }
    this.dataSourceContainer.data(this.cargoItemC);
  }

  async save() {
    if (this.isContainer == "2") {
      this.cargoItems = this.cargoItemC;
    }
    if (this.isContainer == "1" && this.selectedCargoItemIds) {
      for (let i of this.selectedCargoItemIds) {
        let cargoItem = {} as InstockCargoItem;
        let res = await this.cargoFlowService.getBaseCargoItemById(i);
        cargoItem.cargoItemId = res.id;
        cargoItem.batchNumber = res.batchNumber;
        cargoItem.orderQuantity = res.orderQuantity;
        cargoItem.orderNumber = res.orderNumber;
        cargoItem.unit = res.unit;
        this.cargoItems.push(cargoItem);
      }
    }
    if (this.cargoItems) {
      Object.assign(this.vehicle, { cargoItems: this.cargoItems });
    }
    await this.dialogController.ok(this.vehicle);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
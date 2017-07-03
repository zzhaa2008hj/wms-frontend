import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Vehicle } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewVehicle {
  vehicle = {} as Vehicle;

  constructor(private dialogController: DialogController) {
  }

  activate(cargoItem: any) {
    Object.assign(this.vehicle, cargoItem);
    this.vehicle.remark = null;
    if (cargoItem.id) {
      this.vehicle.instockGoodsId = cargoItem.id;
    }
  }

  async save() {
    await this.dialogController.ok(this.vehicle);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
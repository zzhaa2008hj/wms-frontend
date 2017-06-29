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
    console.log(cargoItem);
    Object.assign(this.vehicle, { sign: cargoItem.sign, cargoName: cargoItem.cargoName });
  }

  async save() {
    await this.dialogController.ok(this.vehicle);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
import { DialogController } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { Vehicle } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewVehicle {
  vehicle: Vehicle;

  constructor(private dialogController: DialogController) {

  }

  async save() {
    await this.dialogController.ok(this.vehicle);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
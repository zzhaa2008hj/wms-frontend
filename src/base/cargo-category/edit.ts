import { CargoCategory } from "../models/cargo-category";
import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditCargoCategory {
  cargoCategory: CargoCategory;

  constructor(private dialogController: DialogController) {

  }

  activate(cargoCategory: CargoCategory) {
    this.cargoCategory = cargoCategory;
  }

  async save() {
    await this.dialogController.ok(this.cargoCategory);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
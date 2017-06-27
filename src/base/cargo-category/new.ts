import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { CargoCategory } from "@app/base/models/cargo-category";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewCargoCategory {
  cargoCategory: CargoCategory;
  pCargoCategory: CargoCategory;

  constructor(private dialogController: DialogController) {

  }

  activate(cargoCategory: CargoCategory) {
    this.pCargoCategory = cargoCategory;
  }


  async save() {
    if (this.pCargoCategory) {
      this.cargoCategory.parentId = this.pCargoCategory.id;
    }
    await this.dialogController.ok(this.cargoCategory);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
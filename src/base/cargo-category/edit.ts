import { autoinject } from "aurelia-dependency-injection";
import { WorkInfo } from "../models/workInfo";
import { DialogController } from "../../../jspm_packages/npm/aurelia-dialog@1.0.0-rc.1.0.3/dialog-controller";
import { CargoCategory } from "../models/cargo-category";
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
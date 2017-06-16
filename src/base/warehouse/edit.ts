import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Warehouse } from "../models/warehouse";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWarehouse {
  warehouse: Warehouse;

  constructor(private dialogController: DialogController) {

  }

  activate(warehouse: Warehouse) {
    this.warehouse = warehouse;
  }

  async save() {
    await this.dialogController.ok(this.warehouse);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
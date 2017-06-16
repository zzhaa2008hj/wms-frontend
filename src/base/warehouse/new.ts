import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Warehouse } from "../models/warehouse";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewWarehouse {
  warehouse: Warehouse;
  pWarehouse: Warehouse;

  constructor(private dialogController: DialogController) {

  }

  activate(warehouse: Warehouse) {
    this.pWarehouse = warehouse;
  }


  async save() {
    if (this.pWarehouse) {
      this.warehouse.parentId = this.pWarehouse.id;
    }
    await this.dialogController.ok(this.warehouse);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
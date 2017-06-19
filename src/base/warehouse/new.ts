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
  type = [{ text: "通用", value: 1 }, { text: "保税", value: 2 }, { text: "内贸", value: 3 }];
  category = [{ text: "露天场内", value: 1 }, { text: "库区", value: 2 }];

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
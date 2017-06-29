import { autoinject } from "aurelia-dependency-injection";
import { InstockCargoItem } from "@app/instock/models/cargo-flow";
import { DialogController } from "ui";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewCargoItem {
  selectedCargoItem: any;
  baseCargoItem: any;
  cargoItem = {} as InstockCargoItem;

  constructor(private dialogController: DialogController) {
  }

  activate(baseCargoItem: any) {
    this.baseCargoItem = baseCargoItem;
  }

  onSelectCargoItem(e) {
    let dataItem = this.selectedCargoItem.dataItem(e.item);
    this.cargoItem = dataItem;
    this.cargoItem.cargoItemId = dataItem.id;
    this.cargoItem.id = null;
  }

  async save() {
    await this.dialogController.ok(this.cargoItem);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
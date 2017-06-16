import { autoinject } from "aurelia-dependency-injection";
import { observable } from "aurelia-framework";
import { WarehouseService } from "../services/warehouse";

@autoinject
export class Warehouse {
  @observable
  selectedItem: any;

  warehouseItems: any;

  constructor(private warehouseService: WarehouseService) {
  }

  async activate() {
    this.warehouseItems = await this.warehouseService.listWarehouse();
  }


}
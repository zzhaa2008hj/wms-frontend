import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoItem } from "@app/instock/models/cargo-item";
import { CargoItemService } from "@app/instock/services/cargo-item";

@autoinject
export class Order {
  cargoFlow: CargoFlow;
  cargoItems: CargoItem[];

  constructor(private cargoFlowService: CargoFlowService,
              private cargoItemService: CargoItemService) {
  }

  async activate(params) {
    this.cargoFlow = await this.cargoFlowService.getCargoFlowsById(params.id);
    this.cargoItems = await this.cargoItemService.getCargoItemsByFlowId(params.id);
    console.log(this.cargoItems);
    for (let i = 1; i < this.cargoItems.length; i++) {
      this.cargoItems[i].sequence = i;
    }
  }
}
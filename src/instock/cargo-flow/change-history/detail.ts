import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { DialogController } from 'ui';

@autoinject
export class CargoFlowChangeHistoryDetail {

  cargoFlow: CargoFlow;

  constructor(private dialogController: DialogController) {
  }

  async activate(cargoFlow: CargoFlow) {
    console.log(cargoFlow);
    this.cargoFlow = cargoFlow;
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    console.log(detailRow);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
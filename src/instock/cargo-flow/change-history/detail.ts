import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/models/cargo-flow";
import { DialogController } from 'ui';
import { ChangeHistory } from '@app/common/models/change-history';

@autoinject
export class CargoFlowChangeHistoryDetail {

  oldCargoFlow: CargoFlow;
  newCargoFlow: CargoFlow;

  constructor(private dialogController: DialogController) {
  }

  async activate(changeHistory: ChangeHistory<CargoFlow>) {
    this.oldCargoFlow = changeHistory.oldObj;
    this.newCargoFlow = changeHistory.newObj;
    console.log(this.newCargoFlow)
  }

  detailInit(e) {
    let detailRow = e.detailRow;
    console.log(detailRow);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
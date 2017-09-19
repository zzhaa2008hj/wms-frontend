import { DialogController } from "ui";
import { inject } from "aurelia-dependency-injection";
export class RequisitionOut {
  out = {department: "仓储部", content: "装卸单位结算"};
  constructor(@inject private dialogController: DialogController) {
  }

  async save() {
    await this.dialogController.ok(this.out);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
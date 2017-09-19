import { DialogController } from "ui";
import { inject } from "aurelia-dependency-injection";
export class RequisitionOut {
  out = {};
  constructor(@inject private dialogController: DialogController) {
  }

  activate() {
  }

  async save() {
    await this.dialogController.ok(this.out);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
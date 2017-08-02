import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
@autoinject
export class Audit {


  constructor(private dialogController: DialogController) {
  }


  async auditSecondFee(status: number) {
    await this.dialogController.ok(status);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";

@autoinject
export class VerifyPay {

  paidAmount: number;

  constructor(private dialogController: DialogController) {

  }

  save() {
    this.dialogController.ok(this.paidAmount);
  }

  cancel() {
    this.dialogController.cancel();
  }
}
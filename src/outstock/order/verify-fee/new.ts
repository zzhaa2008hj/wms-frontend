import {inject} from "aurelia-dependency-injection";
import { DialogController} from "ui";

export class VerifyFeeDialogNew {

  status = 1;

  constructor(@inject private dialogController: DialogController) {
  }

  async activate() {
  }

  async save() {
    await this.dialogController.ok(this.status);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
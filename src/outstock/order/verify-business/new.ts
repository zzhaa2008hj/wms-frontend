import {inject} from "aurelia-dependency-injection";
import {VerifyRecord} from "@app/common/models/verify-record";
import { DialogController} from "ui";

export class VerifyBusinessDialogNew {

  verifyRecord = {
    verifyStatus: 1
  } as VerifyRecord;
  constructor(@inject private dialogController: DialogController) {
  }

  async activate() {
  }

  async save() {
    await this.dialogController.ok(this.verifyRecord);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
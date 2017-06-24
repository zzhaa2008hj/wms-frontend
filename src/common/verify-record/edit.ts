import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { VerifyRecord } from '../models/verify-record';

@autoinject
export class EditVerifyRecord {
  verifyRecord: VerifyRecord;

  constructor(private dialogController: DialogController) {

  }

  activate(verifyRecord: VerifyRecord) {
    this.verifyRecord = verifyRecord;
  }

  async save() {
    await this.dialogController.ok(this.verifyRecord);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
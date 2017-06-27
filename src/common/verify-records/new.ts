import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { VerifyRecord } from '@app/common/models/verify-record';

@autoinject
export class NewVerifyRecord {
  verifyRecord: VerifyRecord = {} as VerifyRecord;

  constructor(private dialogController: DialogController) {

  }

  activate(verifyRecord: VerifyRecord) {
    this.verifyRecord = verifyRecord;
  }

  async save() {
    this.verifyRecord.category = 2;
    await this.dialogController.ok(this.verifyRecord);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
} 
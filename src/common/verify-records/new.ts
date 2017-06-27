import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { VerifyRecord } from '@app/common/models/verify-record';
import { ConstantValues } from '@app/common/models/constant-values';

@autoinject
export class NewVerifyRecord {
  verifyRecord: VerifyRecord = {} as VerifyRecord;

  constructor(private dialogController: DialogController) {

  }

  activate(verifyRecord: VerifyRecord) {
    this.verifyRecord = verifyRecord;
    this.verifyRecord.businessTypeStr = ConstantValues.BusinessTypes[this.verifyRecord.businessType - 1];
  }

  async save() {
    this.verifyRecord.category = 2;
    await this.dialogController.ok(this.verifyRecord);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
} 
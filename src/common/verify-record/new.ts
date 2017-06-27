import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { VerifyRecord, VerifyBusiness } from '@app/common/models/verify-record';

@autoinject
export class NewVerifyRecord {
  verifyRecord: VerifyRecord;

  constructor(private dialogController: DialogController) {

  }

  activate(verifyBusiness: VerifyBusiness) {
    this.verifyRecord.batchNumber = verifyBusiness.batchNumber;
    this.verifyRecord.businessId = verifyBusiness.businessId;
    this.verifyRecord.businessName = verifyBusiness.businessName;
    this.verifyRecord.stageBeforeVerify = verifyBusiness.stageBeforeVerify;
  }

  async save() {
    await this.dialogController.ok(this.verifyRecord);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
} 
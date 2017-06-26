import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { VerifyRecord } from '@app/common/models/verify-record';
import * as moment from 'moment';

@autoinject
export class EditVerifyRecord {
  verifyRecord: VerifyRecord = {} as VerifyRecord;

  constructor(private dialogController: DialogController) {

  }

  activate(verifyRecord: VerifyRecord) {
    this.verifyRecord = verifyRecord;
    this.verifyRecord.createTimeStr = moment(this.verifyRecord.createTime).format("YYYY-MM-DD HH:mm:ss");
    this.verifyRecord.verifyStatus = 1;
  }

  async save() {
    await this.dialogController.ok(this.verifyRecord);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
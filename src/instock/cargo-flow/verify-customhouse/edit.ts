/**
 * Created by shun on 2017/7/3.
 */
import {inject} from "aurelia-dependency-injection";
import { CustomhouseClearanceVo, CustomhouseClearance} from "@app/base/models/customhouse";
import { DialogController} from "ui";

export class VerifyCustomhouseDialogEdit {

  customhouseClearanceVo = {} as CustomhouseClearanceVo;
  constructor(@inject private dialogController: DialogController) {
  }

  async activate(customhouseClearance: CustomhouseClearance) {
    this.customhouseClearanceVo.clearanceStatus = customhouseClearance.clearanceStatus;
    if (customhouseClearance.customhouseFlowNumber) {
      this.customhouseClearanceVo.customhouseNumber =  customhouseClearance.customhouseFlowNumber;
    } else {
      this.customhouseClearanceVo.customhouseNumber =  customhouseClearance.customhouseRecordNumber;
    }
  }

  async save() {
    await this.dialogController.ok(this.customhouseClearanceVo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
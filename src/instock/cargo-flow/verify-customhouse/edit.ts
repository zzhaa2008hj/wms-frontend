/**
 * Created by shun on 2017/7/3.
 */
import {inject, newInstance} from "aurelia-dependency-injection";
import { CustomhouseClearanceVo, CustomhouseClearance, validationRules} from "@app/base/models/customhouse";
import { DialogController} from "ui";
import { ValidationController } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

export class VerifyCustomhouseDialogEdit {

  customhouseClearanceVo = {} as CustomhouseClearanceVo;
  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate(customhouseClearance: CustomhouseClearance) {
    this.validationController.addObject(this.customhouseClearanceVo, validationRules);

    this.customhouseClearanceVo.clearanceStatus = customhouseClearance.clearanceStatus;
    if (customhouseClearance.customhouseFlowNumber) {
      this.customhouseClearanceVo.customhouseNumber =  customhouseClearance.customhouseFlowNumber;
    } else {
      this.customhouseClearanceVo.customhouseNumber =  customhouseClearance.customhouseRecordNumber;
    }
  }

  async save() {
    let { valid } = await this.validationController.validate();
    if (!valid) return;
    await this.dialogController.ok(this.customhouseClearanceVo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
/**
 * Created by shun on 2017/7/3.
 */
import {inject, newInstance} from "aurelia-dependency-injection";
import { CustomhouseClearanceVo, validationRules} from "@app/base/models/customhouse";
import { DialogController} from "ui";
import { ValidationController } from "aurelia-validation";
import { formValidationRenderer } from "@app/validation/support";

export class VerifyCustomhouseDialogNew {

  customhouseClearanceVo = {
    clearanceStatus: true
  } as CustomhouseClearanceVo;
  constructor(@inject private dialogController: DialogController,
              @newInstance() private validationController: ValidationController) {
    validationController.addRenderer(formValidationRenderer);
  }

  async activate() {
    this.validationController.addObject(this.customhouseClearanceVo, validationRules);
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
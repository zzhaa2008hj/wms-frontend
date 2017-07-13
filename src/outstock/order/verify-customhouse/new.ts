import {inject} from "aurelia-dependency-injection";
import { CustomhouseClearanceVo} from "@app/base/models/customhouse";
import { DialogController} from "ui";

export class VerifyCustomhouseDialogNew {

  customhouseClearanceVo = {
    clearanceStatus: true
  } as CustomhouseClearanceVo;
  constructor(@inject private dialogController: DialogController) {
  }

  async activate() {
  }

  async save() {
    await this.dialogController.ok(this.customhouseClearanceVo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
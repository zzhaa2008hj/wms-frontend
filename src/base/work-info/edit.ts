import { autoinject } from "aurelia-dependency-injection";
import { WorkInfo } from "../models/work-info";
import { DialogController } from "ui";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWorkInfo {
  workInfo: WorkInfo;

  constructor(private dialogController: DialogController) {

  }

  activate(workInfo: WorkInfo) {
    this.workInfo = workInfo;
  }

  async save() {
    await this.dialogController.ok(this.workInfo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
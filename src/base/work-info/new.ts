import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { WorkInfo } from "../models/work-info";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewWorkInfo {
  workInfo: WorkInfo;
  pWorkInfo: WorkInfo;

  constructor(private dialogController: DialogController) {

  }

  activate(workInfo: WorkInfo) {
    this.pWorkInfo = workInfo;
  }


  async save() {
    if (this.pWorkInfo) {
      this.workInfo.parentId = this.pWorkInfo.id;
    }
    await this.dialogController.ok(this.workInfo);
  }

  async cancel() {
    await this.dialogController.cancel();
  }


}
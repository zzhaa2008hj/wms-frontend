import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { WorkInfo } from "@app/base/models/work-info";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditWorkInfo {
  workInfo: WorkInfo;
  category = [{ text: "入库", value: 1 }, { text: "出库", value: 2 }, { text: "移库", value: 3 }];

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
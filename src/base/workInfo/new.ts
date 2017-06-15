import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { DictionaryService } from "../services/dictionary";
import { autoinject } from "aurelia-dependency-injection";
import { Dictionary } from "../models/Dictionary";
import { WorkInfo } from "../models/workInfo";
import { WorkInfoService } from "../services/workInfo";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewWorkInfo {
  workInfo: WorkInfo;
  pWorkInfo: WorkInfo;

  constructor(private router: Router,
              private workInfoService: WorkInfoService,
              private messageDialogService: MessageDialogService) {

  }

  async activate({ id }) {
    if (id != null && id != "" && id != undefined) {
      this.pWorkInfo = await this.workInfoService.getWorkInfo(id);
    } else {
      this.pWorkInfo = null;
    }
  }

  async addNewWorkInfo() {
    try {
      if (this.pWorkInfo != null) {
        this.workInfo.parentId = this.pWorkInfo.id;
      }
      await this.workInfoService.saveWorkInfo(this.workInfo);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.cancel();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("main");
  }
}
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { NoticeService } from "../services/notice";
import { autoinject } from "aurelia-dependency-injection";
import { Notice } from "../models/Notice";
import { WorkInfoService } from "../services/work-info";
import { WorkInfo } from "../models/work-info";
import { CargoCategoryService } from "../services/cargo-category";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewNotice {
  notice: Notice;
  //数据字典数据方法完成后从数据字典中获取
  category = [{ text: "内部公告", value: 1 }, { text: "外部公告", value: 2 }];
  visible = [{ text: "显示", value: 1 }, { text: "隐藏", value: 2 }];

  constructor(private router: Router,
              private noticeService: NoticeService,
              private messageDialogService: MessageDialogService) {
  }

  async addNewNotice() {
    try {
      await this.noticeService.saveNotice(this.notice);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { Notice } from "@app/base/models/notice";
import { NoticeService } from "@app/base/services/notice";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewNotice {
  notice: Notice = {} as Notice;

  constructor(private router: Router,
              private noticeService: NoticeService,
              private messageDialogService: MessageDialogService) {
    this.notice.category = 1;
  }

  async addNewNotice() {
    try {
      this.notice.visible = 1;
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
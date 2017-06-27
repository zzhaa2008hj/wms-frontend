import { MessageDialogService } from "ui";
import { NoticeService } from "@app/base/services/notice";
import { DataSourceFactory } from "@app/utils";
import { autoinject } from "aurelia-dependency-injection";
@autoinject
export class Notice {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(private noticeService: NoticeService,
              private dataSourceFactory: DataSourceFactory,
              private messageDialogService: MessageDialogService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.noticeService.queryNotices({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  async changeVisible(id) {
    try {
      await this.noticeService.updateVisible(id);
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }


}
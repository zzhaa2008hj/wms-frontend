import { NoticeService } from "../services/notice";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "../../utils";
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



}
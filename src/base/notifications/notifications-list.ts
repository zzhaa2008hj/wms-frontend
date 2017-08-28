import { autoinject } from "aurelia-dependency-injection";
import { MessageResultService, MessageService } from "@app/base/services/message";
import { DataSourceFactory } from "@app/utils";
import { NoticeService } from "@app/base/services/notice";
import { ReadNotification } from "@app/base/notifications/read";
import { DialogService, MessageDialogService } from "ui";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class MsgInfo {

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  unreadDataSource: kendo.data.DataSource;
  allDataSource: kendo.data.DataSource;
  noteDataSource: kendo.data.DataSource;

  constructor(private dataSourceFactory: DataSourceFactory,
              private messageService: MessageService,
              private messageResultService: MessageResultService,
              private noticeService: NoticeService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService,
              private events: EventAggregator) {

    this.unreadDataSource = this.dataSourceFactory.create({
      query: () => this.messageService.getMsgInfo({ read: "1" }),
      pageSize: 15
    });
    this.allDataSource = this.dataSourceFactory.create({
      query: () => this.messageService.getMsgInfo({ read: "0" }),
      pageSize: 15
    });
    this.noteDataSource = this.dataSourceFactory.create({
      query: () => this.noticeService.queryNotices({ visible: "1" }),
      pageSize: 15
    });
  }

  async detail(obj) {
    this.messageResultService.updateMessage(obj.id);
    await this.dialogService
      .open({ viewModel: ReadNotification, model: { body: obj.content, title: obj.title }, lock: true })
      .whenClosed();
    this.allDataSource.read();
    this.unreadDataSource.read();
    this.events.publish('event-source:read');

  }

  async detailNote(obj) {
    await this.dialogService
      .open({ viewModel: ReadNotification, model: { body: obj.content, title: obj.title }, lock: true })
      .whenClosed();
    this.noteDataSource.read();

  }

  async setRead() {
    try {
      await this.messageResultService.setRead();
      await this.messageDialogService.alert({ title: "设置成功" });
      this.unreadDataSource.read();
      this.allDataSource.read();
      this.events.publish('event-source:read');
    } catch (err) {
      await this.messageDialogService.alert({ title: "发生错误", message: err.message, icon: 'error' });
    }
  }

}
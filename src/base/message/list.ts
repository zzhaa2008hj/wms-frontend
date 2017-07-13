import { autoinject } from "aurelia-dependency-injection";
import { MessageService, MessageResultService } from "@app/base/services/message";
import { DialogService } from 'ui';
import { DataSourceFactory } from '@app/utils';
import { MessageDetail } from '@app/base/message/detail';

@autoinject
export class Message {
  searchName: string;

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(private messageService: MessageService,
              private messageResultService: MessageResultService,
              private dialogService: DialogService,
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.messageService.queryMessages({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  async detail(id) {
    let result = await this.dialogService
      .open({ viewModel: MessageDetail, model: id, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
  }

  detailInit(e) {
    let detailRow = e.detailRow;

    detailRow.find('.messageResults').kendoGrid({
      dataSource: this.dataSourceFactory.create({
        query: () => this.messageResultService.queryMessageResult(e.data.id),
        pageSize: 10
      }),
      pageable: true,
      columns: [
        { field: 'receiverName', title: '接收人' },
        { field: 'hasRead == 1? "已读":"未读"', title: '是否已读' },
        { field: 'modifyTime', title: '阅读时间', format: '{0:yyyy-MM-dd HH:mm:ss}' }
      ]
    });
  }

  select() {
    this.dataSource.read();
  }
}
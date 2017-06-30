import { autoinject } from "aurelia-dependency-injection";
import { MessageService, MessageResultService } from "@app/base/services/message";
import { DataSourceFactory } from '@app/utils';
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
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.messageService.queryMessages({ keywords: this.searchName }),
      pageSize: 10
    });
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
        { field: 'modifyTime', title: '读取时间', format: '{0:yyyy-MM-dd HH:mm:ss}' }
      ]
    });
  }

  select() {
    this.dataSource.read();
  }


}
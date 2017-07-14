import { autoinject } from "aurelia-dependency-injection";
import { MessageService } from "@app/base/services/message";
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

  select() {
    this.dataSource.read();
  }
}
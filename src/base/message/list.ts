import { autoinject } from "aurelia-dependency-injection";
import { MessageService } from "@app/base/services/message";
import { DataSourceFactory } from "@app/utils";
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
              private dataSourceFactory: DataSourceFactory) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.messageService.queryMessages({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }


}
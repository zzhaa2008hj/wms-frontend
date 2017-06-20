import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { DataSourceFactory } from "../../utils";
import { MessageService } from "../services/message";
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
              private dataSourceFactory: DataSourceFactory,
              private messageDialogService: MessageDialogService) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.messageService.queryMessages({ keywords: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }


}
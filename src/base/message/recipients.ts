import { DataSourceFactory } from "@app/utils";

import { observable } from "aurelia-framework";
import { bindable, customElement } from "aurelia-templating";
import { MessageResultService } from "@app/base/services/message";

@customElement('message-recipients')
export class MessageRecipients {

  @bindable
  @observable
  messageId: string;

  dataSource: kendo.data.DataSource;

  pageable = true;

  constructor(private messageResultService: MessageResultService,
              dataSourceFactory: DataSourceFactory) {
    this.dataSource = dataSourceFactory.create({
        query: () => this.messageResultService.queryMessageResult(this.messageId),
        pageSize: 10
      });
  }

  idChanged() {
    console.log('id changed', this.messageId);
  }

}
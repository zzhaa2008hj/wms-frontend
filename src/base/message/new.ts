import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { MessageService } from "../services/message";
import { autoinject } from "aurelia-dependency-injection";
import { Message } from "../models/Message";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewMessage {
  message: Message;
  selectedReceiver: any;
  // dataSourceRecceiver = {
  //   transport: {
  //     read: options => {
  //       try {
  //         this.messageService.listRecceiver({ category: this.message.category }).then(options.success);
  //       } catch (err) {
  //         options.error("", "", err);
  //       }
  //     }
  //   }
  // };

  constructor(private router: Router,
              private messageService: MessageService,
              private messageDialogService: MessageDialogService) {
  }

  async addNewMessage() {
    try {
      await this.messageService.saveMessage(this.message);
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
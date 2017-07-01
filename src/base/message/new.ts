import { autoinject } from "aurelia-dependency-injection";
import { MessageService } from "@app/base/services/message";
import { Router } from "aurelia-router";
import { EmployeeService } from "@app/base/services/employee";
import { MessageDialogService } from "ui";
import { Message, MessageVo, MessageResult } from '@app/base/models/message';
import { observable } from 'aurelia-framework';
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewMessage {
  message: Message;
  @observable selectedCategory: number;
  selectedReceiver: any = [];
  dataSourceReceiver = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
      read: async options => {
        try {
          if (!this.selectedCategory) {
            options.success([]);
          }
          let res;
          if (this.selectedCategory == 1) {
            res = await this.employeeService.listEmployee();
          }
          if (this.selectedCategory == 2) {
            res = await this.messageService.listCustomer();
          }
          options.success(res);
        } catch (err) {
          options.error("", "", err);
        }
      }
    }
  });

  constructor(private router: Router,
              private messageService: MessageService,
              private employeeService: EmployeeService,
              private messageDialogService: MessageDialogService) {
    this.selectedCategory = 1;
  }

  selectedCategoryChanged() {
    this.dataSourceReceiver.read();
  }

  async addNewMessage() {
    try {
      this.message.category = this.selectedCategory;
      let messageVo = {} as MessageVo;
      messageVo.message = this.message;
      let receivers: MessageResult[] = [];
      receivers = this.selectedReceiver.value().map(res => {
        let msgRes = {} as MessageResult;
        msgRes.receiverId = res.id;
        msgRes.receiverName = res.name;
        return msgRes;
      });
      messageVo.receivers = receivers;

      await this.messageService.saveMessage(messageVo);
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
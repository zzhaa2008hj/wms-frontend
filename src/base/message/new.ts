import { autoinject } from "aurelia-dependency-injection";
import { MessageService } from "@app/base/services/message";
import { Router } from "aurelia-router";
import { EmployeeService } from "@app/base/services/employee";
import { MessageDialogService } from "ui";
import { Message } from "@app/base/models/message";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewMessage {
  message: Message;
  category = [{ text: "内部", value: 1 }, { text: "外部", value: 2 }];
  selectedCategory: any;
  selectedReceiver: any;
  dataSourceReceiver = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
      read: async options => {
        try {
          if (!this.selectedCategory) {
            options.success([]);
          }
          let res;
          if (this.selectedCategory.value() == 1) {
            res = await this.employeeService.listEmployee();
          }
          if (this.selectedCategory.value() == 2) {
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
  }

  async addNewMessage() {
    try {
      this.message.receiverId = this.selectedReceiver.value();
      this.message.receiverName = this.selectedReceiver.text();
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
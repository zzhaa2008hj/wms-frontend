import { autoinject, Container } from "aurelia-dependency-injection";
import { MessageService } from "@app/base/services/message";
import { Router } from "aurelia-router";
import { EmployeeService } from "@app/base/services/employee";
import { MessageDialogService } from "ui";
import { Message, MessageVo, MessageResult, validationRules } from '@app/base/models/message';
import { observable } from 'aurelia-framework';
import { ValidationController, ValidationControllerFactory } from 'aurelia-validation';
import { formValidationRenderer } from "@app/validation/support";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewMessage {
  message = {} as Message;
  @observable selectedCategory: number;
  @observable disabled: boolean = false;
  id = [] as string[];

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
  validationController: ValidationController;

  constructor(private router: Router,
              private messageService: MessageService,
              private employeeService: EmployeeService,
              private messageDialogService: MessageDialogService,
              validationControllerFactory: ValidationControllerFactory,
              container: Container) {
    this.validationController = validationControllerFactory.create();
    this.validationController.addRenderer(formValidationRenderer);
    container.registerInstance(ValidationController, this.validationController);
    this.selectedCategory = 1;
  }

  selectedCategoryChanged() {
    this.dataSourceReceiver.read();
  }

  async addNewMessage() {
    this.validationController.addObject(this.message, validationRules);
    let { valid } = await this.validationController.validate();
    if (!valid) return;

    this.disabled = true;
    try {
      this.message.category = this.selectedCategory;
      let messageVo = {} as MessageVo;
      messageVo.message = this.message;
      let receivers: MessageResult[] = [];
      receivers = [...this.id].map(res => {
        let r = this.dataSourceReceiver.get(res) as any;
        let msgRes = {} as MessageResult;
        msgRes.receiverId = r.id;
        msgRes.receiverName = r.name;
        return msgRes;
      });
      messageVo.receivers = receivers;

      await this.messageService.saveMessage(messageVo);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
      this.disabled = false;      
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
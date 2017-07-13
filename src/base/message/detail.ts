import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Message } from '@app/base/models/message';
import { MessageService, MessageResultService } from '@app/base/services/message';

@autoinject
export class MessageDetail {
  message = {} as Message;

  constructor(private dialogController: DialogController,
              private messageService: MessageService,
              private messageResultService: MessageResultService) {

  }

  async activate(id: string) {
    this.message = await this.messageService.getMessage(id);
    await this.messageResultService.updateMessage(id);    
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}

import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";

@autoinject
export class Alert {

  title: string;
  message: string;

  constructor(private dialogController: DialogController) {
    dialogController.settings.keyboard = ['Enter'];
  }

  ok() {
    this.dialogController.ok();
  }

  activate({ title, message = title }: AlertOptions) {
    this.title = title;
    this.message = message;
  }

}

export interface AlertOptions {
  title: string;
  message?: string;
}
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";

@autoinject
export class Confirm {

  title: string;
  message: string;

  constructor(private dialogController: DialogController) {
    dialogController.settings.keyboard = true;
  }

  async ok() {
    await this.dialogController.ok();
  }

  async cancel() {
    await this.dialogController.cancel();
  }

  activate({ title, message = title }: ConfirmOptions) {
    this.title = title;
    this.message = message;
  }

}

export interface ConfirmOptions {
  title: string;
  message?: string;
}
import { autoinject } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";

@autoinject
export class Prompt {

  title: string;
  content: string;

  constructor(private dialogController: DialogController) {
    dialogController.settings.keyboard = true;
  }

  activate({ title, content = "" }: PromptOptions) {
    this.title = title;
    this.content = content;
  }

  async ok() {
    await this.dialogController.ok(this.content);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}

export interface PromptOptions {
  title: string;
  content?: string;
}
import { autoinject } from "aurelia-dependency-injection";
import { DialogController } from "ui";
import { Dictionary } from "@app/base/models/dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewDictionary {
  dictionary: Dictionary;

  constructor(private dialogController: DialogController) {

  }

  async save() {
    await this.dialogController.ok(this.dictionary);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
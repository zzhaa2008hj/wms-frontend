import { autoinject } from "aurelia-dependency-injection";
import { Dictionary } from "@app/base/models/dictionary";
import { DialogController } from "ui";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditDictionary {
  dictionary: Dictionary;

  constructor(private dialogController: DialogController) {

  }

  activate(dictionary: Dictionary) {
    this.dictionary = dictionary;
  }


  async save() {
    await this.dialogController.ok(this.dictionary);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
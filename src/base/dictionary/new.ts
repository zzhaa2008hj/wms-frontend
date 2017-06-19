import { Router } from "aurelia-router";
import { DialogController, MessageDialogService } from "ui";
import { DictionaryService } from "../services/dictionary";
import { autoinject } from "aurelia-dependency-injection";
import { Dictionary } from "../models/Dictionary";
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
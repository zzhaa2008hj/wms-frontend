import { autoinject, inject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { DictionaryService } from "../services/dictionary";
import { DialogController, MessageDialogService } from "ui";
import { Dictionary } from "../models/Dictionary";
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
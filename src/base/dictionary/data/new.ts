import { DialogController } from "ui";
import { Dictionary } from "../../models/Dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
export class NewDictionaryData {
  dictionaryData: Dictionary;
  dictionary: Dictionary;


  constructor(private dialogController: DialogController) {

  }

  activate(dictionary: Dictionary) {
    this.dictionary = dictionary;
  }


  async save() {
    if (this.dictionary) {
      this.dictionaryData.dictCode = this.dictionary.dictCode;
    }
    await this.dialogController.ok(this.dictionaryData);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
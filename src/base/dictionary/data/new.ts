import { DialogController } from "ui";
import { Dictionary, DictionaryData } from "../../models/Dictionary";
import { inject } from "aurelia-dependency-injection";
/**
 * Created by Hui on 2017/6/14.
 */
export class NewDictionaryData {
  dictionaryData: DictionaryData;
  dictCode: string;


  constructor(@inject private dialogController: DialogController) {

  }

  activate(dictionary: Dictionary) {
    this.dictCode = dictionary.dictCode;
  }


  async save() {
    if (this.dictCode) {
      this.dictionaryData.dictCode = this.dictCode;
    }
    await this.dialogController.ok(this.dictionaryData);
  }

  async cancel() {
    await this.dialogController.cancel();
  }

}
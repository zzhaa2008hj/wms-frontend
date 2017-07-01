import { DialogController } from "ui";
import { inject } from "aurelia-dependency-injection";
import { DictionaryData, Dictionary } from '@app/base/models/dictionary';
/**
 * Created by Hui on 2017/6/14.
 */
export class NewDictionaryData {
  dictionaryData: DictionaryData;
  dictCode: string;

  constructor(@inject private dialogController: DialogController) {

  }

  activate(dictCode: string) {
    console.log(dictCode)
    this.dictCode = dictCode;
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
import { autoinject} from "aurelia-dependency-injection";
import { Dictionary } from "../../models/dictionary";
import { DialogController } from "ui";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject()
export class EditDictionaryData {
  dictionaryData: Dictionary;

  constructor(private dialogController: DialogController) {

  }

  activate(dictionaryData: Dictionary) {
    this.dictionaryData = dictionaryData;
  }

  async save() {
    await this.dialogController.ok(this.dictionaryData);
  }

  async cancel() {
    await this.dialogController.cancel();
  }
}
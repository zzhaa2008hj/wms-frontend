import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { autoinject, inject } from "aurelia-dependency-injection";
import { DictionaryDataService, DictionaryService } from "../../services/dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
export class NewDictionaryData {
  dictionaryData: { dictCode: string, dictDataCode: string, dictDataName: string, description: string, sort: number };

  constructor(@inject private router: Router,
              @inject private dictionaryDataService: DictionaryDataService,
              @inject private messageDialogService: MessageDialogService,
              @inject("dictionary") private dictionary: any) {
  }

  async addNewDictionaryData() {
    try {
      this.dictionaryData.dictCode = this.dictionary.dictCode;
      await this.dictionaryDataService.saveDictionaryData(this.dictionaryData);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.cancel();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
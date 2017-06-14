import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { DictionaryService } from "../services/dictionary";
import { autoinject } from "aurelia-dependency-injection";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class NewDictionary {
  dictionary: { dictCode: string, dictName: string, remark: string };

  constructor(private router: Router,
              private dictionaryService: DictionaryService,
              private messageDialogService: MessageDialogService) {
  }

  async addNewDictionary() {
    try {
      await this.dictionaryService.saveDictionary(this.dictionary);
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
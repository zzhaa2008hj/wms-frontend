import { autoinject, inject } from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { DictionaryService } from "../services/dictionary";
import { MessageDialogService } from "ui";
import { Dictionary } from "../models/Dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject
export class EditDictionary {
  dictionary: Dictionary;

  constructor( private router: Router,
               private dictionaryService: DictionaryService,
               private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.dictionary = await this.dictionaryService.getDictionary(id);
  }

  async updateDictionary() {
    try {
      await this.dictionaryService.updateDictionary(this.dictionary);
      await this.messageDialogService.alert({ title: "编辑成功" });
      this.cancel();
    } catch (err) {
      await this.messageDialogService.alert({ title: "发生错误", message: err.mesasge, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
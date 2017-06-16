import { autoinject} from "aurelia-dependency-injection";
import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { DictionaryDataService } from "../../services/dictionary";
import { Dictionary } from "../../models/dictionary";
/**
 * Created by Hui on 2017/6/14.
 */
@autoinject()
export class EditDictionaryData {
  dictionaryData: Dictionary;

  constructor( private router: Router,
               private dictionaryDataService: DictionaryDataService,
               private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.dictionaryData = await this.dictionaryDataService.getDictionaryData(id);
  }

  async updateDictionaryData() {
    try {
      await this.dictionaryDataService.updateDictionaryData(this.dictionaryData);
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
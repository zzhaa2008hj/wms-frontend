import { DictionaryService } from "../services/dictionary";
import { autoinject } from "aurelia-dependency-injection";
import { DialogService, MessageDialogService } from "ui";
import { createDataSource } from "../../utils";
import { EditDictionary } from "./edit";
import { NewDictionary } from "./new";
@autoinject
export class Dictionary {
  searchName: string;

  dataSource = createDataSource({
    read: () => this.dictionaryService.queryDictionaries({ name: this.searchName }),
    serverPaging: true,
    pageSize: 10
  });

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private dictionaryService: DictionaryService,
              private dialogService: DialogService,
              private messageDialogService: MessageDialogService) {
  }

  select() {
    this.dataSource.read();
  }

  async changeState(id) {
    try {
      await this.dictionaryService.updateState(id);
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  async add() {
    let result = await this.dialogService.open({ viewModel: NewDictionary, model: {}, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.dictionaryService.saveDictionary(result.output);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  async edit(dictionary: Dictionary) {
    let result = await this.dialogService.open({ viewModel: EditDictionary, model: dictionary, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.dictionaryService.updateDictionary(result.output);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.dictionaryService.deleteDictionary(id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}
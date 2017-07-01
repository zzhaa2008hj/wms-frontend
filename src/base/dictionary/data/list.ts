import { DialogService, MessageDialogService } from "ui";
import { inject } from "aurelia-dependency-injection";
import { NewDictionaryData } from "./new";
import { EditDictionaryData } from "./edit";
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DataSourceFactory } from '@app/utils';
import { Dictionary } from '@app/base/models/dictionary';

export class DictionaryData {
  searchName: string;
  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };
  private dataSource: kendo.data.DataSource;

  constructor(@inject private dictionaryDataService: DictionaryDataService,
              @inject private messageDialogService: MessageDialogService,
              @inject private dataSourceFactory: DataSourceFactory,
              @inject private dialogService: DialogService,
              @inject("dictionary") private dictionary: Dictionary) {
    this.dataSource = this.dataSourceFactory.create({
      query: () => this.dictionaryDataService.queryDictionaryDatas(this.dictionary.dictCode, { name: this.searchName }),
      pageSize: 10
    });
  }

  select() {
    this.dataSource.read();
  }

  async changeState(id) {
    try {
      await this.dictionaryDataService.updateState(id);
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }

  async add() {
    let result = await this.dialogService
      .open({
        viewModel: NewDictionaryData,
        model: this.dictionary.dictCode,
        lock: true
      })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      console.log(result.output)
      await this.dictionaryDataService.saveDictionaryData(result.output);
      await this.messageDialogService.alert({ title: "新增成功", message: "新增成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: "error" });
    }
  }

  async edit(dictionaryData: DictionaryData) {
    let result = await this.dialogService.open({ viewModel: EditDictionaryData, model: dictionaryData, lock: true })
      .whenClosed();
    if (result.wasCancelled) return;
    try {
      await this.dictionaryDataService.updateDictionaryData(result.output);
      await this.messageDialogService.alert({ title: "编辑成功", message: "编辑成功！" });
      this.dataSource.read();
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: "error" });
    }
  }

  async delete(id) {
    try {
      if (await this.messageDialogService.confirm({ title: "删除:", message: "删除后无法恢复" })) {
        await this.dictionaryDataService.deleteDictionaryData(id);
        this.dataSource.read();
      }
    } catch (err) {
      await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
    }
  }
}
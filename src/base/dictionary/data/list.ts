import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { createDataSource } from "../../../utils";
import { DictionaryDataService } from "../../services/dictionary";
@autoinject
export class DictionaryData {
  searchName: string;
  dataSource = createDataSource({
    read: () => this.dictionaryDataService.queryDictionaryData({ name: this.searchName }),
    serverPaging: true,
    pageSize: 10
  });

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private dictionaryDataService: DictionaryDataService,
              private messageDialogService: MessageDialogService) {
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

}
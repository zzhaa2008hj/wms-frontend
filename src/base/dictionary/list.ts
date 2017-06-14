import { Router } from "aurelia-router";
import { DictionaryService } from "../services/dictionary";
import { createDataSource } from "../../utils";
import { autoinject } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
@autoinject
export class Dictionary {
  searchName: string;

  dataSource = createDataSource({
    read: () => this.dictionaryService.queryDictionary({ name: this.searchName }),
    serverPaging: true,
    pageSize: 10
  });

  pageable = {
    refresh: true,
    pageSizes: true,
    buttonCount: 10
  };

  constructor(private dictionaryService: DictionaryService,
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

}
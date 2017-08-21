import { customElement, bindable } from "aurelia-templating";
import { observable, inject } from "aurelia-framework";
import { StorageList } from "./list";

@customElement('storage-info')
export class StorageInfo {

  dataSource: kendo.data.DataSource;

  @bindable
  @observable
  parentUid: string;

  constructor(@inject private storageList: StorageList) {

  }


  parentUidChanged() {
    this.dataSource = this.storageList.getNewDataSourceByUid(this.parentUid);
  }


}
import { autoinject } from "aurelia-dependency-injection";
import { WorkInfoService } from "../services/workInfo";
import { MessageDialogService } from "ui";
import { observable } from "aurelia-binding";

@autoinject
export class WorkInfo {
  @observable
  selectedItem: any;

  workInfoItems: any;
  path: WorkInfo[];
  status: boolean;
  state: boolean;
  id: string = "";

  constructor(private workInfoService: WorkInfoService, private messageDialogService: MessageDialogService) {
  }

  async activate() {
    this.workInfoItems = await this.workInfoService.listWorkInfo();

  }

  selectedItemChanged(e) {
   this.onChange(e);

  }

  onChange(e) {
    // let t = e.detail.sender as kendo.ui.TreeView; //TODO 抽到utils
    // let selectedItem: any = t.select()[0];
    // this.selectedItem = t.dataItem(selectedItem);
    // console.log(this.selectedItem);
    this.id = this.selectedItem.id;
    console.log(e);
  }

  // async changeState() {
  //   try {
  //     await this.workInfoService.updateState(this.id);
  //   } catch (err) {
  //     await this.messageDialogService.alert({ title: "错误:", message: err.message, icon: 'error' });
  //   }
  // }
}
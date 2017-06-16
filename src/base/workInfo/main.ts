import { autoinject } from "aurelia-dependency-injection";
import { WorkInfoService } from "../services/workInfo";
import { MessageDialogService } from "ui";
import { observable } from "aurelia-framework";

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

}
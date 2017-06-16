import { autoinject } from "aurelia-dependency-injection";
import { observable } from "aurelia-framework";
import { WorkInfoService } from "../services/work-info";

@autoinject
export class WorkInfo {
  @observable
  selectedItem: any;

  workInfoItems: any;

  constructor(private workInfoService: WorkInfoService) {
  }

  async activate() {
    this.workInfoItems = await this.workInfoService.listWorkInfo();
  }


}
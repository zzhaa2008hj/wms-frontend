import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { CargoFlow } from "@app/instock/cargo-flow/list";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class NewCargoFlow {
  names: any;
  cargoFlow: CargoFlow;
  title: string;
  titleName: string;
  //入库新增先要录入客户基础信息,基础信息新增后 录入
  constructor(private router: Router,
              private cargoFlowService: CargoFlowService,
              private messageDialogService: MessageDialogService) {
  }

  async addNewCargoFlow() {
    try {
      await this.cargoFlowService.saveCargoFlow(this.cargoFlow);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    console.log(this.names);
    console.log(this.title);
    console.log(this.titleName);
    // this.router.navigateToRoute("list");
  }
}
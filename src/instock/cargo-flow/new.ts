import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { autoinject } from "aurelia-dependency-injection";
import { CargoFlowService } from "@app/instock/services/cargo-flow";
import { CargoInfo } from "@app/base/models/cargo-info";
import { CargoInfoService } from "@app/base/services/cargo-info";
import { CargoFlow } from "@app/instock/models/cargo-flow";
/**
 * Created by Hui on 2017/6/23.
 */
@autoinject
export class NewCargoFlow {
  cargoFlow: CargoFlow;
  cargoInfo: CargoInfo;
  cargoItem: CargoItem[];
  selectedCargoInfo: any;
  //入库新增先要录入客户基础信息,基础信息新增后 录入
  constructor(private router: Router,
              private cargoFlowService: CargoFlowService,
              private cargoInfoService: CargoInfoService,
              private messageDialogService: MessageDialogService) {
  }

  async activate() {
    // 获取基础信息
    this.cargoInfo = await this.cargoInfoService.// 通过基础信息id获取一个批次货物明细
      this.cargoItem = await cargoFlowService.listCargoItems(this.cargoInfo.id);
  }

  onSelectCargoInfo(e) {
    let dataItem = this.selectedCargoInfo.dataItem(e.item);
    console.log(dataItem);
    this.cargoFlow = dataItem;
    console.log("cargoFlow:" + this.cargoFlow);
  }

  async addNewCargoFlow() {
    try {
      await
        this.cargoFlowService.saveCargoFlow(this.cargoFlow);
      await
        this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await
        this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}
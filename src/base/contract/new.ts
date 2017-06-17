import { Router } from "aurelia-router";
import { autoinject, newInstance } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { ContractService } from "../services/contract";
import { WorkInfo } from "src/base/models/workInfo";
import { ContractVo } from "../models/contractVo";

@autoinject
export class NewContract {
  contractVo: ContractVo;
  contractTypes = [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
  warehouse: WorkInfo;

  constructor(private router: Router,
              private contractService: ContractService,
              @newInstance() private validationController: ValidationController,
              private messageDialogService: MessageDialogService) {
  }

  async activate({ id }) {
    this.warehouse = await this.contractService.getWarehouses();
  }

  async save() {
    try {
      await this.contractService.saveContract(this.contractVo);
      await this.messageDialogService.alert({ title: "编辑成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "编辑失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

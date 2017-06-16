import { Router } from "aurelia-router";
import { autoinject, newInstance } from "aurelia-dependency-injection";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { ContractService } from "../services/contract";
import { WorkInfo } from "src/base/models/workInfo";
import { Contract } from "./index";

@autoinject
export class NewContract {
  contract: Contract;
  contracTypes = [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
  warehouse : WorkInfo;

  constructor(private router: Router,
              private contractService: ContractService,
              @newInstance() private validationController: ValidationController,
              private messageDialogService: MessageDialogService) {
  }

  async activate({id}) {
    this.warehouse = await this.contractService.getWarehouses();
  }

  async save() {
    try {
      await this.contractService.saveContract(this.contract);
      await this.messageDialogService.alert({ title: "新增成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "新增失败", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }
}

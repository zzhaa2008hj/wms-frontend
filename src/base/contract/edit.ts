import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { inject, newInstance } from "aurelia-dependency-injection";
import { ContractVo } from "../models/contractVo";
import { ContractService } from "../services/contract";

export class EditContract {
  contractVo: ContractVo;

  constructor(@inject private router: Router,
              private contractService: ContractService,
              @newInstance() private validationController: ValidationController,
              @inject private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.contractVo = await this.contractService.getContract(id);
  }

  /**
   * TODO refactor
   */
  /* tslint:disable */
  formatMethod(type: number) {
    return ['客户仓储', '装卸单位', '库区租赁', 'delete'][type - 1] || 'unknown';
  }

  async update() {
    try {
      await this.contractService.updateContract(this.contractVo);
      await this.messageDialogService.alert({ title: "机构编辑成功" });
      this.cancel();
    } catch (err) {
      await this.messageDialogService.alert({ title: "发生错误", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

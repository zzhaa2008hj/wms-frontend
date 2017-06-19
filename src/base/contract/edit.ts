import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import {autoinject, newInstance} from "aurelia-dependency-injection";
import { ContractVo } from "../models/contractVo";
import { ContractService } from "../services/contract";
import {WorkInfo} from "src/base/models/workInfo";

@autoinject
export class EditContract {
  contractVo: ContractVo;
  warehouse: WorkInfo;

  constructor( private router: Router,
               private contractService: ContractService,
              @newInstance() private validationController: ValidationController,
               private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.contractVo = await this.contractService.getContract(id);
    if(this.contractVo.contract.contractType == 3){
      //库区信息
      this.warehouse = await this.contractService.getWarehouses();
    }
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
      await this.messageDialogService.alert({ title: "编辑成功" });
      this.router.navigateToRoute("list");
    } catch (err) {
      await this.messageDialogService.alert({ title: "发生错误", message: err.message, icon: 'error' });
    }
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

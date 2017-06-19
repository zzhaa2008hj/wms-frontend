import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import {autoinject, newInstance} from "aurelia-dependency-injection";
import { ContractVo } from "../models/contractVo";
import { ContractService } from "../services/contract";
import {WorkInfo} from "src/base/models/workInfo";

@autoinject
export class ViewContract {
  contractVo: ContractVo;
  warehouse: WorkInfo;
  contractId: string;

  constructor( private router: Router,
               private contractService: ContractService,
              @newInstance() private validationController: ValidationController,
               private messageDialogService: MessageDialogService) {
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.contractId=id;
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



  cancel() {
    this.router.navigateToRoute("list");
  }

}

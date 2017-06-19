import { Router } from "aurelia-router";
import { MessageDialogService } from "ui";
import { ValidationController } from "aurelia-validation";
import { autoinject, newInstance } from "aurelia-dependency-injection";
import { ContractVo } from "../models/contractVo";
import { ContractService } from "../services/contract";
import { Rate } from "../models/rate";
import { WorkInfo } from "../models/work-info";

@autoinject
export class EditContract {
  contractVo: ContractVo;
  warehouse: WorkInfo;
  baseRateAndSteps: Rate[];
  customerGrid: any;
  datasource;

  constructor(private router: Router,
              private contractService: ContractService,
              @newInstance() private validationController: ValidationController,
              private messageDialogService: MessageDialogService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.baseRateAndSteps);
        },
        update: (options) => {
          options.success();
        },
        destroy: (options) => {
          options.success();
        }
      },
      schema: {
        model: {
          id: 'id'
        }
      }
    });
  }

  /**
   * 初始化后自动执行
   */
  async activate({ id }) {
    this.contractVo = await this.contractService.getContract(id);
    if (this.contractVo.contract.contractType == 3) {
      //库区信息
      this.warehouse = await this.contractService.getWarehouses();
    } else {
      this.baseRateAndSteps = await this.contractService.getBaseRate();
      this.baseRateAndSteps = this.baseRateAndSteps
        .filter(x => x.customerCategory == this.contractVo.contract.contractType);
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

  updateProp(item, property) {
    item.trigger('change', { field: property });
    item.dirty = true;
  }

  cancel() {
    this.router.navigateToRoute("list");
  }

}

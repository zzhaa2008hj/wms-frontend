import { Router } from "aurelia-router";
import {autoinject } from "aurelia-dependency-injection";
import { ContractVo } from "../models/contractVo";
import { ContractService } from "../services/contract";
import {WorkInfo} from "../models/work-info";
import {RateStep} from "../models/rateStep";
import {Rate} from "../models/rate";

@autoinject
export class ViewContract {
  contractVo: ContractVo;
  contractTypes = [{"name": "客户仓储", "type": 1}, {"name": "装卸单位", "type": 2}, {"name": "库区租赁", "type": 3}];
  warehouses: WorkInfo;
  datasource: kendo.data.DataSource;
  /**
   * 基础费率
   */
  baseRateAndSteps: Rate[];

  /**
   * 基础阶梯费率
   */
  baseRateStep: RateStep[];
  constructor( private router: Router,
               private contractService: ContractService) {
    this.datasource = new kendo.data.DataSource({
      transport: {
        read: (options) => {
          options.success(this.baseRateAndSteps);
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
      this.warehouses = await this.contractService.getWarehouses();
    } else {
      this.baseRateAndSteps = this.contractVo.rateVos
      this.baseRateStep =this.contractVo.rateStepVos;
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

  detailInit(e) {
    let detailRow = e.detailRow;

    detailRow.find('.rateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.baseRateStep);
          }
        },
        filter: {field: 'rateId', operator: 'eq', value: e.data.id}
      },
      columns: [
        {field: 'stepNum', title: '阶梯号'},
        {field: 'stepStart', title: '开始值'},
        {field: 'stepEnd', title: '结束值'},
        {field: 'stepPrice', title: '阶梯价'},
        {field: 'stepUnit', title: '单位'},
        {field: 'remark', title: '备注'}
      ]
    });
  }
}

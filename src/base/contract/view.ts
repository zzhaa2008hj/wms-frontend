import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { ContractService } from "@app/base/services/contract";
import { WorkInfo } from "@app/base/models/work-info";
import { Rate, RateStep } from "@app/base/models/rate";
import { ContractVo } from '@app/base/models/contractVo';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';

@autoinject
export class ViewContract {
  contractVo: ContractVo;
  contractTypes = [{ "name": "客户仓储", "type": 1 }, { "name": "装卸单位", "type": 2 }, { "name": "库区租赁", "type": 3 }];
  warehouses: WorkInfo[];
  datasource: kendo.data.DataSource;
  /**
   * 基础费率
   */
  baseRateAndSteps: Rate[];

  unit = [] as DictionaryData[];
  warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];

  /**
   * 基础阶梯费率
   */
  baseRateStep: RateStep[];

  constructor(private router: Router,
              private dictionaryDataService: DictionaryDataService,
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
    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");
    
    this.contractVo = await this.contractService.getContract(id);
    if (this.contractVo.contract.contractType == 3) {
      //库区信息
      this.warehouses = await this.contractService.getWarehouses();
    } else {
      let rates = this.contractVo.rateVos;
      rates.map(res => {
        let unit = this.unit.find(d => res.unit == d.dictDataCode);
        let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
        let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
        if (unit) {
          res.unit = unit.dictDataCode;
          res.unitStr = unit.dictDataName;
        }
        if (warehouseType) {
          res.warehouseType = warehouseType.dictDataCode;
          res.warehouseTypeStr = warehouseType.dictDataName;
        }
        if (warehouseCategory) {
          res.warehouseCategory = warehouseCategory.dictDataCode;
          res.warehouseCategoryStr = warehouseCategory.dictDataName;
        }
        return res;
      });
      this.baseRateAndSteps = rates;
      this.baseRateStep = this.contractVo.rateStepVos;
    }
  }

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
        filter: { field: 'rateId', operator: 'eq', value: e.data.id }
      },
      columns: [
        { field: 'stepNum', title: '阶梯号' },
        { field: 'stepStart', title: '开始值' },
        { field: 'stepEnd', title: '结束值' },
        { field: 'stepPrice', title: '阶梯价' },
        { field: 'stepUnit', title: '单位' },
        { field: 'remark', title: '备注' }
      ]
    });
  }
}

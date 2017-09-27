import { Router } from "aurelia-router";
import { autoinject } from "aurelia-dependency-injection";
import { ContractService } from "@app/base/services/contract";
import { WorkInfo } from "@app/base/models/work-info";
import { Rate, RateStep } from "@app/base/models/rate";
import { ContractVo } from '@app/base/models/contractVo';
import { DictionaryData } from '@app/base/models/dictionary';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { ConstantValues } from '@app/common/models/constant-values';
import * as moment from 'moment';

@autoinject
export class ViewContract {
  contractVo: ContractVo;
  contractTypes = ConstantValues.ContractTypes;
  chargeCategory = ConstantValues.ChargeCategory;
  warehouses: WorkInfo[];
  datasource: kendo.data.DataSource;
  /**
   * 基础费率
   */
  baseRateAndSteps: Rate[];

  unit = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];
  rateTypes = ConstantValues.WorkInfoCategory;

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
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.contractVo = await this.contractService.getContract(id);
    this.contractVo.contract.contractTypeStr = this.contractTypes
      .find(d => d.type == this.contractVo.contract.contractType).name;
    this.contractVo.contract.startTimeStr = moment(this.contractVo.contract.startTime).format("YYYY-MM-DD HH:mm:ss");
    this.contractVo.contract.endTimeStr = moment(this.contractVo.contract.endTime).format("YYYY-MM-DD HH:mm:ss");
    this.contractVo.contract.signDateStr = moment(this.contractVo.contract.signDate).format("YYYY-MM-DD");
    if (this.contractVo.contract.contractType == 3) {
      //库区信息
      this.warehouses = await this.contractService.getWarehouses();
    }
    let rates = this.contractVo.rateVos;
    console.log(rates)
    rates.map(res => {
      let unit = this.unit.find(d => res.unit == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
      let rateType = this.rateTypes.find(d => res.rateType == d.value);
      res.chargeCategoryStr = this.chargeCategory.find(x => x.value == res.rateCategory).text;
      if (unit) {
        res.unitStr = unit.dictDataName;
      }
      if (warehouseCategory) {
        res.warehouseCategoryStr = warehouseCategory.dictDataName;
      }
      if (rateType) {
        res.rateTypeStr = rateType.text;
      }
      return res;
    });
    this.baseRateAndSteps = rates;
    this.baseRateStep = this.contractVo.rateStepVos;
    this.baseRateStep.map(res => {
      if (res.stepUnit) {
        res.stepUnitStr = this.unit.find(r => r.dictDataCode == res.stepUnit).dictDataName;
      }
      return res;
    });

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
        { field: 'stepUnitStr', title: '单位' },
        { field: 'remark', title: '备注' }
      ]
    });
  }
}

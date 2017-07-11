import { autoinject } from 'aurelia-dependency-injection';
import { ContractVo } from '@app/base/models/contractVo';
import { ChangeHistory } from '@app/common/models/change-history';
import * as moment from 'moment';
import { DialogController } from 'ui';
import { DictionaryDataService } from '@app/base/services/dictionary';
import { DictionaryData } from '@app/base/models/dictionary';
import { Rate } from '@app/base/models/rate';

@autoinject
export class ChangeHistoryDetail {

  oldContractVo: ContractVo;
  newContractVo: ContractVo;

  unit = [] as DictionaryData[];
  warehouseType = [] as DictionaryData[];
  warehouseCategory = [] as DictionaryData[];

  constructor(private dialogController: DialogController,
    private dictionaryDataService: DictionaryDataService) {

  }

  async activate(changeHistory: ChangeHistory<ContractVo>) {

    this.unit = await this.dictionaryDataService.getDictionaryDatas("unit");
    this.warehouseType = await this.dictionaryDataService.getDictionaryDatas("warehouseType");
    this.warehouseCategory = await this.dictionaryDataService.getDictionaryDatas("warehouseCategory");

    this.oldContractVo = changeHistory.oldObj;
    this.newContractVo = changeHistory.newObj;
    this.oldContractVo.contract.startTimeStr = moment(this.oldContractVo.contract.startTime)
      .format("YYYY-MM-DD");
    this.oldContractVo.contract.endTimeStr = moment(this.oldContractVo.contract.endTime)
      .format("YYYY-MM-DD");
    this.oldContractVo.contract.signDateStr = moment(this.oldContractVo.contract.signDate)
      .format("YYYY-MM-DD");
    this.newContractVo.contract.startTimeStr = moment(this.newContractVo.contract.startTime)
      .format("YYYY-MM-DD");
    this.newContractVo.contract.endTimeStr = moment(this.newContractVo.contract.endTime)
      .format("YYYY-MM-DD");
    this.newContractVo.contract.signDateStr = moment(this.newContractVo.contract.signDate)
      .format("YYYY-MM-DD");

    if (this.oldContractVo.contract.contractType != 3) {
      this.oldContractVo.rateVos = this.convertData(this.oldContractVo.rateVos);
      this.newContractVo.rateVos = this.convertData(this.newContractVo.rateVos);
    }
  }

  oldDetailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.oldRateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.oldContractVo.rateStepVos);
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

  newDetailInit(e) {
    let detailRow = e.detailRow;
    detailRow.find('.newRateSteps').kendoGrid({
      dataSource: {
        transport: {
          read: (options) => {
            options.success(this.newContractVo.rateStepVos);
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

  async cancel() {
    await this.dialogController.cancel();
  }

  private convertData(rates: Rate[]): Rate[] {
    return rates.map(res => {
      let unit = this.unit.find(d => res.unit == d.dictDataCode);
      let warehouseType = this.warehouseType.find(d => res.warehouseType == d.dictDataCode);
      let warehouseCategory = this.warehouseCategory.find(d => res.warehouseCategory == d.dictDataCode);
      if (unit) {
        res.unit = unit.dictDataName;
      }
      if (warehouseType) {
        res.warehouseType = warehouseType.dictDataName;
      }
      if (warehouseCategory) {
        res.warehouseCategory = warehouseCategory.dictDataName;
      }
      return res;
    });
  }
}
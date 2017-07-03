import { autoinject } from 'aurelia-dependency-injection';
import { ContractVo } from '@app/base/models/contractVo';
import { ChangeHistory } from '@app/common/models/change-history';
import * as moment from 'moment';
import { DialogController } from 'ui';

@autoinject
export class ChangeHistoryDetail {

  oldContractVo: ContractVo;
  newContractVo: ContractVo;

  constructor(private dialogController: DialogController) {

  }

  activate(changeHistory: ChangeHistory<ContractVo>) {
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
}
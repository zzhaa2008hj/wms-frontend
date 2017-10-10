import { ValidationRules } from 'aurelia-validation';
import { BaseEntity } from '@app/common/models/base-entity';

export interface CargoMortgage extends BaseEntity {

  // 客户货物主键
  cargoInfoId: string;

  // 系统生成的质押单号(ZY201706300001)
  codeNumber: string;

  // 客户提供的质押单号
  customerPledgeNumber: string;

  // 批次号
  batchNumber: string;

  // 货物明细主键
  cargoItemId: string;

  cargoCategoryName: string;

  // 货物质押状态
  status: number;

  // 货物名称
  cargoName: string;

  // 出质客户主键
  pledgorId: string;

  // 出质客户名称
  pledgorName: string;

  // 质权客户主键
  pledgeeId: string;

  // 质权客户名称
  pledgeeName: string;

  // 质押数量
  pledgeQuantity: number;

  // 质押件数
  pledgeNumber: number;

  // 计量单位
  unit: string;
  unitStr: string;

  // 质押开始时间
  pledgeStartDate: Date;
  pledgeStartDateStr: string;

  // 质押结束时间
  pledgeEndDate: Date;
  pledgeEndDateStr: string;
  
  // 解押人主键
  cancelPledgeId: string;

  // 解押人名称
  cancelPledgeName: string;

  // 解押时间
  cancelPledgeTime: Date;
  cancelPledgeTimeStr: string;

  // 解押说明
  cancelRemark: string;

  // 审核状态
  auditStatus: string;

  // 上一阶段号
  lastStage: number;

  // 阶段号
  stage: number;
  stageStr: string;

  // 审核人主键
  auditorId: string;

  // 审核人名称
  auditorName: string;

  auditTime: Date;
  auditTimeStr: string;

  unfrozenQuantity: number;
  unfrozenNumber: number;
}

export const cargoMortgageValidateRules = ValidationRules
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.cargoInfoId)
  .displayName('批次号')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.customerPledgeNumber)
  .displayName('客户质押单号')
  .maxLength(50).withMessage(`\${$displayName} 长度不能超过50`)
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.cargoItemId)
  .displayName('质押货物')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.pledgeNumber)
  .displayName('质押件数')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies((x: number, cargoMortgage: CargoMortgage) => {
    if (x && x > cargoMortgage.unfrozenNumber) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能大于可质押件数`)
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.pledgeQuantity)
  .displayName('质押数量')
  .required().withMessage(`\${$displayName} 不能为空`)
  .satisfies((x: number, cargoMortgage: CargoMortgage) => {
    if (x && x > cargoMortgage.unfrozenQuantity) {
      return false;
    }
    return true;
  }).withMessage(`\${$displayName} 不能大于可质押数量`)

  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.pledgeeId)
  .displayName('质权客户')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.pledgeStartDate)
  .displayName('质押开始时间')
  .required().withMessage(`\${$displayName} 不能为空`)
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.pledgeEndDate)
  .displayName('质押结束时间')
  .required().withMessage(`\${$displayName} 不能为空`)
  
  .ensure((cargoMortgage: CargoMortgage) => cargoMortgage.remark)
  .displayName('备注')
  .maxLength(200).withMessage(`\${$displayName} 长度不能超过200`)

  .rules;
import { ValidationRules } from 'aurelia-validation';
import { ContractVo } from '@app/base/models/contractVo';
export interface Contract {
  id: string;
  /**
   * 1：客户仓储；2：装卸单位；3：库区租赁
   */
  contractType: number;

  contractTypeStr: string;

  customerId: string;

  customerName: string;

  contractNumber: string;

  contractName: string;

  contractAmount: number;

  startTime: Date;
  startTimeStr: string;

  endTime: Date;
  endTimeStr: string;

  signer: string;

  signDate: Date;
  signDateStr: string;

  auditorId: string;

  auditorName: string;

  auditorTime: Date;

  status: number;
  statusTitle: string;

  createAccountId: string;

  remark: string;

  orgId: string;
}

export interface ContractSearch {

  chargeCategory: string;

  cargoCategoryId: string;

  cargoCategoryName: string;

  rateType: number;

  workName: string;

  workId: string;

  warehouseCategory: number;

  pricingMode: number;

  rateCategory: number;
}

export const contractValidationRules = ValidationRules
  .ensure((contract: Contract) => contract.contractType)
  .displayName('合同类型')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.customerId)
  .displayName('客户名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.contractNumber)
  .displayName('合同编号')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((contract: Contract) => contract.contractName)
  .displayName('合同名称')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((contract: Contract) => contract.startTime)
  .displayName('合同开始日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.endTime)
  .displayName('合同结束日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.signDate)
  .displayName('合同签订日期')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((contract: Contract) => contract.signer)
  .displayName('签订人')
  .required().withMessage(`\${$displayName} 不能为空`)
  .maxLength(50).withMessage(`\${$displayName} 过长`)

  .ensure((contract: Contract) => contract.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;

export const warehouseIdRules = ValidationRules
  .ensure((contractVo: ContractVo) => contractVo.warehouseId)
  .displayName('存放库区')
  .required().withMessage(`\${$displayName} 不能为空`)
  .rules;
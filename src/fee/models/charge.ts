import { ChargeAuditList, ChargeAuditItem } from '@app/fee/models/charge-audit';
import { ValidationRules } from 'aurelia-validation';

export interface ChargeInfo {
  id: string;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  chargeStartDate: Date;
  chargeEndDate: Date;
  paymentUnit: string;
  status: number;
  lastStage: number;
  stage: number;
  auditorId: string;
  auditorName: string;
  auditTime: Date;
  remark: string;
  orgId: string;
  type: number;

  chargeStartDateStr: string;
  chargeEndDateStr: string;

  totalReceivableAmount: number;
  totalReceivedAmount: number;

  stageName: string;
  lastStageName: string;

  chargeAuditItemList: ChargeAuditItem[];

  createTime: Date;
  createTimeStr: string;

  chargeAuditList: ChargeAuditList[];

  //费用总计
  feeTotal: number;

  statusTitle: string; 
}

export const chargeInfoValidationRules = ValidationRules
  .ensure((info: ChargeInfo) => info.agentId)
  .displayName('代理商名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.customerId)
  .displayName('客户名称')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: ChargeInfo) => info.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 长度不能超过500`)
  .rules;
import { ChargeAuditList } from '@app/fee/models/charge-audit';
import { ValidationRules } from 'aurelia-validation';
import { CargoRateStep } from '@app/base/models/cargo-info';
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

  chargeItemList: ChargeItem[];

  createTime: Date;
  createTimeStr: string;
  
  chargeAuditList: ChargeAuditList[];
}

export interface ChargeItem {
  id: string;
  remark: string;
  orgId: string;

  // 需求表主键
  chargeInfoId: string;
  /**
   * 出入库、移库等
   */
  rateType: number;
  // 费用类别
  chargeCategory: number;
  // 批次号
  batchNumber: string;
  // 货名
  cargoName: string;
  // 货类主键
  cargoCategoryId: string;
  // 货类
  cargoCategoryName: string;
  // 品牌
  cargoSubCategoryName: string;
  // 库区主键
  warehouseId: string;
  // 库区名称
  warehouseName: string;
  // 数量
  quantity: number;
  // 件数
  number: number;
  // 计量单位
  unit: string;

  unitName: string;
  rateTypeName: string;
  chargeCategoryName: string;

  cargoItemId: string;
  cargoRateId: string;
  actualPrice: number;
  pricingMode: number;
  price: number;
  cargoRateStepList: CargoRateStep[];
  // 作业内容
  workName: string;
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
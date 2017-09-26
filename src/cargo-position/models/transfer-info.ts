import { CargoRate } from "@app/base/models/cargo-info";
import { ValidationRules } from 'aurelia-validation';

export interface PositionTransferInfo {
  id: string;
  cargoInfoId: string;
  batchNumber: string;
  transferNumber: string;
  demandFrom: number;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  status: number;
  lastStage: number;
  stage: number;
  auditorId: string;
  auditorName: string;
  auditTime: Date;
  remark: string;
  orgId: string;
  createTime: Date;

  positionTransferItems: PositionTransferItem[];
}

export interface PositionTransferItem {
  id: string;
  transferInfoId: string;
  cargoItemId: string;
  cargoName: string;
  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCategoryName: string;
  cargoType: number;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  storageQuantity: number;
  storageNumber: number;
  newWarehouseId: string;
  newWarehouseName: string;
  transferQuantity: number;
  transferNumber: number;
  transferDate: Date;
  remark: string;
  orgId: string;

  // 集装箱号
  containerNumber: string;
  //集装箱类型
  containerType: string;

  cargoRates: CargoRate[];
}

export interface PositionTransferSearch {
  warehouseName ?: string;
  cargoName ?: string;
}

export const positionTransferInfoValidationRules = ValidationRules
  .ensure((info: PositionTransferInfo) => info.transferNumber)
  .displayName('货位转移单号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: PositionTransferInfo) => info.batchNumber)
  .displayName('批次号')
  .required().withMessage(`\${$displayName} 不能为空`)

  .ensure((info: PositionTransferInfo) => info.remark)
  .displayName('备注')
  .maxLength(500).withMessage(`\${$displayName} 过长`)
  .rules;
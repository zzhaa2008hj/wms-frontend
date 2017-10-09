import { CargoRate } from '@app/base/models/cargo-info';
import { StorageItem } from '@app/base/models/storage';
import { AttachmentMap } from '@app/common/models/attachment';
import { ValidationRules } from 'aurelia-validation';
export interface CargoownershipTransfer {
  id: string;
  orgId: string;
  remark: string;

  // 客户货物主键
  cargoInfoId: string;

  // 原批次号
  originalBatchNumber: string;

  // 原代理商主键
  originalAgentId: string;

  // 原代理商名称
  originalAgentName: string;

  // 原客户主键
  originalCustomerId: string;

  // 原客户名称
  originalCustomerName: string;

  // 新批次号
  newBatchNumber: string;

  // 新代理商主键
  newAgentId: string;

  // 新代理商名称
  newAgentName: string;

  // 新客户主键
  newCustomerId: string;

  // 新客户名称
  newCustomerName: string;

  // 转移日期
  transferDate: Date;

  // 仓储费结算至日期
  storageEndDate: Date;

  // 出库费承担方主键
  outstockChargePayerId: string;

  // 出库费承担方名称
  outstockChargePayerName: string;

  // 业务状态
  status: number;

  // 上一阶段号
  lastStage: number;

  // 当前阶段号
  stage: number;

  // 审核人主键
  auditorId: string;

  // 审核人名称
  auditorName: string;

  // 审核时间
  auditTime: Date;

  stageName: string;
  lastStageName: string;

  transferItems: TransferCargoItemVo[];
  attachments: AttachmentMap[];
  // 0 生成新的批次 1并票
  batchNumberMode: number;

  storageEndDateStr: string;
  transferDateStr: string;

  createAccountId: string;
}

export interface CargoownershipTransferItem {
  id: string;
  orgId: string;
  remark: string;

  batchNumber: string;
  // 货权转移ID
  cargoownershipTransferId: string;

  cargoItemId: string;

  cargoName: string;

  cargoCategoryId: string;

  cargoCategoryName: string;

  cargoSubCategoryName: string;
  // 指令数量
  orderQuantity: number;
  // 指令件数
  orderNumber: number;
  //单位
  unitStr: string;

  unit: string;

  cargoInfoId: string;
  freeDays: number;

  storageItems: TransferCargoStorageItem[];
  cargoRates: CargoRate[];
  unitName: string;

  canQuantity: number;
  canNumber: number;
}

export interface CargoOwnershipTransferRate {
  batchNumber: string ;
  // 费用类型 出入库、移库等
  rateType: number ;
  rateTypeStr: string;

  // 费用类别 仓储费、装卸费等
  rateCategory: number ;
  // 作业ID
  workId: string ;
  // 作业名称
  workName: string;
  // 货权转移明细ID
  transferItemId: string;
}
export interface TransferCargoStorageItem{
  id: string;
  // 库存信息表主键
  transferItemId: string;
  // 库区主键
  warehouseId: string;
  // 库区名称
  warehouseName: string;
  // 集装箱号
  containerNumber: string;
  // 堆存数量
  storageQuantity: number;
  // 堆存件数
  storageNumber: number;
  // 计量单位
  unit: string;

  remark: string;

  orgId: string;

  unitName: string;

  canQuantity: number;
  canNumber: number;
}
export interface TransferCargoItemVo {
  id: string;
  orgId: string;
  remark: string;
  cargoInfoId: string;
  batchNumber: string;
  cargoName: string;
  cargoCategoryId: string;
  cargoCategoryName: string;
  cargoSubCatergoryName: string;
  unit: string;
  freeDays: number;

  // 库存
  storageQuantity: number;
  storageNumber: number;
  // 费收扣量
  distrainQuantity: number;
  distrainNumber: number;
  // 正在出库量
  outstockQuantity: number;
  outstockNumber: number;
  // 实际可转移数
  quantity: number;
  number: number;
  // 转移数
  transferQuantity: number;
  transferNumber: number;

  transferFreeDays: number;
  // 费率
  cargoRates: CargoRate[];
  // 库存明细
  storageItems: TransferStorageItemVo[];
  
  unitName: string;
  // 合同费率
  contractRates: CargoRate[];
}

export interface TransferStorageItemVo extends StorageItem{
  // 可转数量
  quantity: number;
  number: number;
}

export interface CargoOwnershipTranferRateStep {
// 主键
  id: string ;
// 货权费率ID
  transferRateId: string;
  // 序号
  stepNumber: number;
  // 起始数
  stepStart: number;
  // 结尾数
  stepEnd: number;
  // 单价
  stepPrice: number;
  // 实际单价
  actualStepPrice: number;

  /*stepUnit: string;

  stepUnitName: string;

  stepUnitStr: string;*/
  storageItems: TransferCargoStorageItem[];
  cargoRates: CargoRate[];
  unitName: string;

  canQuantity: number;
  canNumber: number;
}

export interface CargoownershipTransferVo {
  id: string;
  orgId: string;
  remark: string;
  // 客户货物主键
  cargoInfoId: string;
  // 原批次号
  originalBatchNumber: string;
  // 原代理商主键
  originalAgentId: string;
  // 原代理商名称
  originalAgentName: string;
  // 原客户主键
  originalCustomerId: string;
  // 原客户名称
  originalCustomerName: string;
  // 新批次号
  newBatchNumber: string;
  // 新代理商主键
  newAgentId: string;
  // 新代理商名称
  newAgentName: string;
  // 新客户主键
  newCustomerId: string;
  // 新客户名称
  newCustomerName: string;
  // 转移日期
  transferDate: Date;
  // 仓储费结算至日期
  storageEndDate: Date;
  // 出库费承担方主键
  outstockChargePayerId: string;
  // 出库费承担方名称
  outstockChargePayerName: string;
  // 业务状态
  status: number;
  // 上一阶段号
  lastStage: number;
  // 当前阶段号
  stage: number;
  // 审核人主键
  auditorId: string;
  // 审核人名称
  auditorName: string;
  // 审核时间
  auditTime: Date;
  stageName: string;
  lastStageName: string;
  transferDateStr: string;
  storageEndDateStr: string;
  transferItems: CargoownershipTransferItem[];
}

export const transferValidationRules = ValidationRules
.ensure((transfer: CargoownershipTransfer) => transfer.originalAgentId)
.displayName('原代理商')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.originalCustomerId)
.displayName('原客户')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.newAgentId)
.displayName('新代理商')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.newCustomerId)
.displayName('新客户')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.originalBatchNumber)
.displayName('原批次')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.transferDate)
.displayName('转让日期')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.outstockChargePayerId)
.displayName('出库费用承担方')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.storageEndDate)
.displayName('仓储费用结算至日期')
.required().withMessage(`\${$displayName} 不能为空`)

.ensure((transfer: CargoownershipTransfer) => transfer.remark)
.displayName('备注')
.maxLength(500).withMessage(`\${$displayName} 过长`)
.rules;

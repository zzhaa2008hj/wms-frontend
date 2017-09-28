import { ValidationRules } from "aurelia-validation";
import { CargoRateStep } from '@app/base/models/cargo-info';

export interface ChargeAuditList {
  id: string;
  chargeInfoId: string;
  batchNumber: string;
  billLadingNumber: string;
  containerQuantity: number;
  warehousingAmount: number;
  loadingAmount: number;
  otherAmount: number;
  sumAmount: number;
  invoiceType: number;
  invoiceStatus: number;
  invoiceNumber: string;
  paymentUnit: string;
  paymentDate: Date;
  paymentStatus: number;
  receivableAmount: number;
  receivedAmount: number;
  remark: string;
  orgId: string;

  chargeAuditItems: ChargeAuditItem[];

  index: number;

  paymentDateStr: string;
}

export interface ChargeAuditItem {
  id: string;
  chargeAuditId: string;
  rateType: number;
  chargeCategory: number;
  batchNumber: string;
  cargoName: string;
  cargoCategoryName: string;
  cargo_subCategoryName: string;
  warehouseId: string;
  warehouseName: string;
  number: number;
  quantity: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  containerType: string;
  container_quantity: number;
  storageDay: number;
  storageRate: number;
  remark: string;
  orgId: string;

  startDateStr: string;
  endDateStr: string;
  unitStr: string;
  containerTypeStr: string;
  rateTypeName: string;
  chargeCategoryName: string;

  // 作业表主键
  workOrderId: string;
  // 作业过程主键
  workOrderItemId: string;
  // 作业内容名称
  workInfoName: string;
  // 费用
  amount: number;
  // 作业日期
  workDate: Date;

  cargoItemId: string;
  cargoRateId: string;
  actualPrice: number;
  pricingMode: number;
  price: number;
  cargoRateStepList: CargoRateStep[];
  // 业务主键
  businessId: string;
  // 作业区域主键
  workOrderAreaId: string;

  //合计
  sumAmount: number;
}

export const chargeAuditListValidationRules = ValidationRules
  .ensure((chargeAuditList: ChargeAuditList) => chargeAuditList.invoiceNumber)
  .displayName("发票号")
  .required().withMessage(`\${$displayName}不能为空`)
  .rules;

export const auditListValidationRules = ValidationRules
  .ensure((chargeAuditList: ChargeAuditList) => chargeAuditList.batchNumber)
  .displayName("批次号")
  .required().withMessage(`\${$displayName}不能为空`)

  .ensure((chargeAuditList: ChargeAuditList) => chargeAuditList.billLadingNumber)
  .displayName("提单号")
  .required().withMessage(`\${$displayName}不能为空`)
  .rules;
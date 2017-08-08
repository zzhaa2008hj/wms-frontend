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
  containerType: number;
  container_quantity: number;
  storageDay: number;
  storageRate: number;
  remark: string;
  orgId: string;

  startDateStr: string;
  endDateStr: string;
  unitStr: string;

  rateTypeName: string;
  chargeCategoryName: string;
}
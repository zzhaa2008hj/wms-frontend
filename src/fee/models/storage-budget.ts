export interface StorageBudgetItem {
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
  // 费用
  amount: number;
  cargoItemId: string;
  cargoRateId: string;
  actualPrice: number;
  pricingMode: number;
  price: number;
  cargoRateStepList: CargoRateStep[];
  // 业务主键
  businessId: string;
  //合计
  sumAmount: number;
  //入库时间
  instockDate: Date;
  //堆存天数
  storageDays:number;
}
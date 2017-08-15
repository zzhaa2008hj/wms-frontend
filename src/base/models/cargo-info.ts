/**
 *  客户货物信息
 */
export interface CargoInfo {
  cargoFlowSize: number;

  id: string;

  batchNumber: string;
  batchNumberStr: string;

  billLadingNumber: string;

  contractId: string;

  contractNumber: string;

  agentId: string;

  agentName: string;

  customerId: string;

  customerName: string;

  /**
   * 公共/承包
   */
  warehouseType: string;
  warehouseTypeStr: string;
  /**˙
   * 内贸/保税
   */
  cargoType: number;

  /**
   * 散货/集装箱
   */
  cargoForm: number;

  unit: string;

  orderQuantity: number;

  orderNumber: number;

  instockQuantity: number;

  instockNumber: number;

  outstockQuantity: number;

  outstockNumber: number;

  instockStatus: number;

  outstockStatus: number;

  finished: number;

  remark: string;

  /**
   * 录入方式  1/null:正常录入 2：补录
   */
  enteringMode: number;

  cargoItems: CargoItem[];
}

/**
 * 货物明细
 */
export interface CargoItem {
  id: string;

  cargoInfoId: string;

  batchNumber: string;

  cargoName: string;

  cargoCategoryId: string;

  cargoCategoryName: string;

  cargoSubCatergoryName: string;

  orderQuantity: number;

  orderNumber: number;

  unit: string;
  unitStr: string;

  freeDays: number;

  cargoRates: CargoRate[];

  remark: string;

  canQuantity: number;
  canNumber: number;
}

/**
 * 货物费率
 */
export interface CargoRate {
  id: string;

  chargeType: number;

  batchNumber: string;

  cargoItemId: string;

  rateType: number;
  rateTypeStr: string;

  rateCategory: number;

  workId: string;

  workName: string;

  cargoCategoryId: string;

  cargoCategoryName: string;

  cargoSubCategoryName: string;

  pricingMode: number;

  unit: string;
  unitStr: string;

  price: number;

  actualPrice: number;

  /**
   * 内贸、保税、承包内贸、承包保税
   */
  warehouseType: string;
  warehouseTypeStr: string;
  /**
   * 场、库
   */
  warehouseCategory: string;
  warehouseCategoryStr: string;

  cargoRateSteps: CargoRateStep[];
}

/**
 * 货物阶梯费率
 */
export interface CargoRateStep {
  id: string;

  // cargoRateId: String;

  customerRateId: String;

  stepNum: number;

  stepStart: number;

  stepEnd: number;

  stepPrice: number;

  stepUnit: string;

  stepUnitName: string;
  
  stepUnitStr: string;
}
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
  actualPrice: number;
}
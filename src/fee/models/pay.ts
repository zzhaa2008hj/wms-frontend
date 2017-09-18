export class PaymentInfo {
  id: string;

  customerId: string;

  customerName: string;

  chargeStartDate: Date;

  chargeStartDateStr: string;

  chargeEndDate: Date;

  chargeEndDateStr: string;

  status: number;

  statusTitle: string;

  lastStage: number;

  lastStageTitle: string;

  stage: number;

  stageTitle: string;

  auditorId: string;

  auditorName: string;

  auditTime: Date;
  /**
   * 1：自动生成 2：手动生成
   */
  type: number;

  typeTitle: string;

  remark: string;

  createTime: Date; //创建时间

  createTimeStr: string;

  createAccount: String;  //创建账号

  payableAmount: number; // 应收费用 相当于总计
  
  paidAmount: number; // 已收费用

  paymentAuditItemList: PaymentAuditItem[];

  invoiceStatus: number;
  
  invoiceStatusStr: string;

  paymentStatus: number;
  
  paymentStatusStr: string;
  
  orgId: string;

  payableAmountStr: string;
}

export class PaymentAuditItem {
  index: number;

  id: string;

  paymentInfoId: string;

  workOrderNumber: string;

  workDate: Date;

  workDateStr: string;

  workName: string;

  cargoName: string;

  cargoCategoryName: string;

  warehouseName: string;

  price: number;

  quantity: number;

  number: number;

  workNumber: number;

  unit: string;

  sumAmount: number;

  type: number;
  cargoCategoryId: string;
  warehouseId: string;
  customerRateId: string;
  unitStr: string;
  remark: string;
}    
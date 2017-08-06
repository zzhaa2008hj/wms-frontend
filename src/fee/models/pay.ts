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

  sumFee: number;
}

export class PaymentAuditListVo {
  paymentInfo: PaymentInfo;

  paymentAuditList: PaymentAuditList;

  paymentAuditItemList: PaymentAuditItem[];
}

export class PaymentAuditList {
  id: string;

  paymentInfoId: string;

  sumFee: number;

  invoiceType: number;

  invoiceTypeStr: string;

  invoiceStatus: number;

  invoiceStatusStr: string;

  invoiceNumber: string;

  paymentDate: Date;

  paymentStatus: number;

  paymentStatusStr: string;

  payableAmount: number;

  paidAmount: number;
}

export class PaymentAuditItem {
  id: string;

  paymentAuditId: string;

  workOrderNumber: string;

  workDate: Date;

  workName: string;

  cargoName: string;

  cargoCategoryName: string;

  warehouseName: string;

  price: number;

  quantity: number;

  number: number;

  unit: string;

  sumAmount: number;
}    
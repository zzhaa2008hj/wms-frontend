export class PaymentInfo {
  id: string;
  customerId: string;

  customerName: string;

  chargeStartDate: Date;

  chargeStartDateStr: string;

  chargeEndDate: Date;

  chargeEndDateStr: string;

  status: number;

  lastStage: number;

  stage: number;

  auditorId: string;

  auditorName: string;

  auditTime: Date;
}

export class PaymentAuditList {
  id: string;

  paymentInfoId: string;

  sumFee: number;

  invoiceType: number;

  invoiceStatus: number;

  invoiceNumber: string;

  paymentDate: Date;

  paymentStatus: number;

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
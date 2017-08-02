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

  chargeStartDateStr: string;
  chargeEndDateStr: string;

  totalReceivableAmount: number;
  totalReceivedAmount: number;
}

export interface ChargeItem {

}